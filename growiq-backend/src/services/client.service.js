// src/services/client.service.js
const { query, transaction } = require('../config/db');
const logger = require('../utils/logger');

class ClientService {
    /**
     * List clients for an agency with pagination, search, and filter
     */
    static async listClients(agencyId, { page = 1, limit = 10, search = '', status = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
        const offset = (page - 1) * limit;
        const params = [agencyId];
        let paramIndex = 2;

        let whereClause = 'WHERE c.agency_id = $1 AND c.is_archived = false';

        if (search) {
            whereClause += ` AND (c.business_name ILIKE $${paramIndex} OR c.contact_name ILIKE $${paramIndex} OR c.contact_email ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        if (status) {
            whereClause += ` AND c.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        // Validate sort columns to prevent SQL injection
        const allowedSorts = ['created_at', 'business_name', 'status', 'health_score', 'monthly_retainer'];
        const safeSortBy = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // Count total
        const countResult = await query(
            `SELECT COUNT(*) FROM clients c ${whereClause}`,
            params
        );
        const total = parseInt(countResult.rows[0].count, 10);

        // Fetch clients
        const clientParams = [...params, limit, offset];
        const result = await query(
            `SELECT c.*,
                    (SELECT COUNT(*) FROM campaigns WHERE client_id = c.id) as campaign_count,
                    (SELECT COUNT(*) FROM invoices WHERE client_id = c.id AND status = 'overdue') as overdue_invoices
             FROM clients c
             ${whereClause}
             ORDER BY c.${safeSortBy} ${safeSortOrder}
             LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            clientParams
        );

        return {
            clients: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    /**
     * Get a single client by ID (must belong to the agency)
     */
    static async getClientById(clientId, agencyId) {
        const result = await query(
            `SELECT c.*,
                    (SELECT COUNT(*) FROM campaigns WHERE client_id = c.id) as campaign_count,
                    (SELECT COUNT(*) FROM invoices WHERE client_id = c.id AND status = 'overdue') as overdue_invoices,
                    (SELECT json_agg(json_build_object(
                        'id', ci.id, 'platform', ci.platform, 'status', ci.status, 'last_synced_at', ci.last_synced_at
                    )) FROM client_integrations ci WHERE ci.client_id = c.id) as integrations
             FROM clients c
             WHERE c.id = $1 AND c.agency_id = $2 AND c.is_archived = false`,
            [clientId, agencyId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    /**
     * Create a new client
     */
    static async createClient(agencyId, clientData) {
        const {
            business_name, contact_name, contact_email, contact_phone,
            industry, website, gst_number, plan,
            monthly_retainer, contract_start, contract_end, notes
        } = clientData;

        const result = await query(
            `INSERT INTO clients (
                agency_id, business_name, contact_name, contact_email, contact_phone,
                industry, website, gst_number, plan,
                monthly_retainer, contract_start, contract_end, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *`,
            [
                agencyId, business_name, contact_name, contact_email, contact_phone,
                industry, website, gst_number, plan || 'starter',
                monthly_retainer || 0, contract_start || null, contract_end || null, notes || null
            ]
        );

        return result.rows[0];
    }

    /**
     * Update a client
     */
    static async updateClient(clientId, agencyId, updateData) {
        // Build dynamic SET clause
        const allowedFields = [
            'business_name', 'contact_name', 'contact_email', 'contact_phone',
            'industry', 'website', 'gst_number', 'plan', 'monthly_retainer',
            'contract_start', 'contract_end', 'status', 'notes'
        ];

        const updates = [];
        const params = [];
        let paramIndex = 1;

        for (const field of allowedFields) {
            if (updateData[field] !== undefined) {
                updates.push(`${field} = $${paramIndex}`);
                params.push(updateData[field]);
                paramIndex++;
            }
        }

        if (updates.length === 0) {
            throw new Error('No valid fields to update');
        }

        updates.push(`updated_at = CURRENT_TIMESTAMP`);

        params.push(clientId, agencyId);
        const result = await query(
            `UPDATE clients SET ${updates.join(', ')}
             WHERE id = $${paramIndex} AND agency_id = $${paramIndex + 1} AND is_archived = false
             RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    /**
     * Soft delete (archive) a client
     */
    static async archiveClient(clientId, agencyId) {
        const result = await query(
            `UPDATE clients SET is_archived = true, status = 'churned', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND agency_id = $2
             RETURNING id, business_name`,
            [clientId, agencyId]
        );

        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0];
    }

    /**
     * Calculate client health score (0-100)
     */
    static async calculateHealthScore(clientId) {
        let score = 50; // base score

        // Check if campaigns are active
        const campaignResult = await query(
            `SELECT COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'active') as active_count
             FROM campaigns WHERE client_id = $1`,
            [clientId]
        );
        const { total, active_count } = campaignResult.rows[0];
        if (parseInt(total, 10) > 0) {
            score += (parseInt(active_count, 10) / parseInt(total, 10)) * 15;
        }

        // Check ROAS from recent metrics
        const roasResult = await query(
            `SELECT AVG(cm.roas) as avg_roas
             FROM campaign_metrics cm
             JOIN campaigns c ON c.id = cm.campaign_id
             WHERE c.client_id = $1 AND cm.date >= CURRENT_DATE - INTERVAL '30 days'`,
            [clientId]
        );
        const avgRoas = parseFloat(roasResult.rows[0].avg_roas) || 0;
        if (avgRoas >= 4) score += 20;
        else if (avgRoas >= 2.5) score += 10;
        else if (avgRoas > 0) score += 5;

        // Check overdue invoices
        const overdueResult = await query(
            `SELECT COUNT(*) as overdue_count FROM invoices
             WHERE client_id = $1 AND status = 'overdue'`,
            [clientId]
        );
        const overdueCount = parseInt(overdueResult.rows[0].overdue_count, 10);
        score -= overdueCount * 10;

        // Clamp 0–100
        score = Math.max(0, Math.min(100, Math.round(score)));

        // Update client
        await query(
            'UPDATE clients SET health_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [score, clientId]
        );

        return score;
    }
}

module.exports = ClientService;

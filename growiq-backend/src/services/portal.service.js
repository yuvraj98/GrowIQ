// src/services/portal.service.js
const { query } = require('../config/db');

class PortalService {
    /**
     * Get a comprehensive summary for a client in the portal
     */
    static async getPortalSummary(clientId) {
        // 1. Get Client Info
        const clientResult = await query('SELECT id, business_name, status FROM clients WHERE id = $1', [clientId]);
        if (!clientResult.rows.length) throw new Error('Client not found');
        const client = clientResult.rows[0];

        // 2. Get Aggregated Metrics (Last 30 Days)
        const metricsResult = await query(`
            SELECT 
                COALESCE(SUM(m.spend), 0) as total_spend,
                COALESCE(SUM(m.conversions), 0) as total_conversions,
                COALESCE(AVG(m.roas), 0) as avg_roas
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.id
            WHERE c.client_id = $1 AND m.date >= CURRENT_DATE - INTERVAL '30 days'
        `, [clientId]);

        // 3. Get Recent Reports
        const reportsResult = await query(`
            SELECT id, title, status, created_at 
            FROM reports 
            WHERE client_id = $1 
            ORDER BY created_at DESC LIMIT 3
        `, [clientId]);

        // 4. Get Outstanding Invoices
        const invoicesResult = await query(`
            SELECT id, invoice_number, total_amount, status, due_date
            FROM invoices
            WHERE client_id = $1 AND status = 'pending'
            ORDER BY due_date ASC
        `, [clientId]);

        // 5. Get Top Ranking Keywords
        const seoResult = await query(`
            SELECT keyword, current_position, previous_position
            FROM seo_keywords
            WHERE client_id = $1 AND current_position <= 10
            ORDER BY current_position ASC LIMIT 5
        `, [clientId]);

        return {
            client,
            metrics: metricsResult.rows[0],
            recentReports: reportsResult.rows,
            pendingInvoices: invoicesResult.rows,
            topKeywords: seoResult.rows
        };
    }

    /**
     * Get all reports for a client (portal view)
     */
    static async getPortalReports(clientId) {
        const result = await query(`
            SELECT id, title, ai_summary, status, created_at, period_start, period_end
            FROM reports
            WHERE client_id = $1
            ORDER BY created_at DESC
        `, [clientId]);
        return result.rows;
    }
}

module.exports = PortalService;

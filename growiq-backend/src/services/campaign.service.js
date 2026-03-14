// src/services/campaign.service.js
const { query } = require('../config/db');
const logger = require('../utils/logger');

class CampaignService {
    /**
     * List campaigns for an agency (across all clients or for one client)
     */
    static async listCampaigns(agencyId, options = {}) {
        const {
            clientId = null,
            platform = '',
            status = '',
            page = 1,
            limit = 20,
        } = options;

        const offset = (page - 1) * limit;
        const conditions = ['cl.agency_id = $1', 'cl.is_archived = false'];
        const params = [agencyId];
        let idx = 2;

        if (clientId) { conditions.push(`c.client_id = $${idx++}`); params.push(clientId); }
        if (platform) { conditions.push(`c.platform = $${idx++}`); params.push(platform); }
        if (status)   { conditions.push(`c.status = $${idx++}`); params.push(status); }

        const where = conditions.join(' AND ');

        const [rows, countRow] = await Promise.all([
            query(`
                SELECT c.*,
                    cl.business_name AS client_name,
                    -- Last 7 days aggregate metrics
                    COALESCE(SUM(m.spend), 0)       AS total_spend,
                    COALESCE(SUM(m.impressions), 0) AS total_impressions,
                    COALESCE(SUM(m.clicks), 0)      AS total_clicks,
                    COALESCE(SUM(m.conversions), 0) AS total_conversions,
                    COALESCE(AVG(m.roas), 0)        AS avg_roas,
                    COALESCE(AVG(m.ctr), 0)         AS avg_ctr
                FROM campaigns c
                JOIN clients cl ON c.client_id = cl.id
                LEFT JOIN campaign_metrics m ON m.campaign_id = c.id
                    AND m.date >= CURRENT_DATE - INTERVAL '7 days'
                WHERE ${where}
                GROUP BY c.id, cl.business_name
                ORDER BY c.created_at DESC
                LIMIT $${idx} OFFSET $${idx + 1}
            `, [...params, limit, offset]),
            query(`
                SELECT COUNT(*) FROM campaigns c
                JOIN clients cl ON c.client_id = cl.id
                WHERE ${where}
            `, params),
        ]);

        return {
            campaigns: rows.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countRow.rows[0].count),
                totalPages: Math.ceil(parseInt(countRow.rows[0].count) / limit),
            },
        };
    }

    /**
     * Get single campaign with 30-day daily metrics
     */
    static async getCampaignById(campaignId, agencyId) {
        const campaignResult = await query(`
            SELECT c.*, cl.business_name AS client_name, cl.agency_id
            FROM campaigns c
            JOIN clients cl ON c.client_id = cl.id
            WHERE c.id = $1 AND cl.agency_id = $2
        `, [campaignId, agencyId]);

        if (!campaignResult.rows.length) return null;
        const campaign = campaignResult.rows[0];

        // Get last 30 days of metrics
        const metricsResult = await query(`
            SELECT * FROM campaign_metrics
            WHERE campaign_id = $1
            ORDER BY date DESC
            LIMIT 30
        `, [campaignId]);

        campaign.metrics = metricsResult.rows.reverse(); // chronological order
        return campaign;
    }

    /**
     * Create a campaign manually (before API sync)
     */
    static async createCampaign(agencyId, data) {
        // Verify client belongs to agency
        const clientCheck = await query(
            'SELECT id FROM clients WHERE id = $1 AND agency_id = $2 AND is_archived = false',
            [data.client_id, agencyId]
        );
        if (!clientCheck.rows.length) throw new Error('Client not found or unauthorized');

        const result = await query(`
            INSERT INTO campaigns (
                client_id, platform, name, objective, status,
                budget_total, budget_daily, start_date, end_date, platform_campaign_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            data.client_id, data.platform, data.name, data.objective || null,
            data.status || 'active',
            data.budget_total || null, data.budget_daily || null,
            data.start_date || null, data.end_date || null,
            data.platform_campaign_id || null,
        ]);

        return result.rows[0];
    }

    /**
     * Update campaign status / budget
     */
    static async updateCampaign(campaignId, agencyId, data) {
        const allowed = ['name', 'status', 'budget_total', 'budget_daily', 'objective', 'start_date', 'end_date'];
        const fields = Object.keys(data).filter(k => allowed.includes(k));
        if (!fields.length) return null;

        const sets = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');
        const values = fields.map(f => data[f]);

        const result = await query(`
            UPDATE campaigns c
            SET ${sets}, updated_at = NOW()
            FROM clients cl
            WHERE c.id = $1 AND c.client_id = cl.id AND cl.agency_id = $2
            RETURNING c.*
        `, [campaignId, agencyId, ...values]);

        return result.rows[0] || null;
    }

    /**
     * Upsert daily campaign metrics (used by sync + seed)
     */
    static async upsertMetrics(campaignId, date, metrics) {
        await query(`
            INSERT INTO campaign_metrics (
                campaign_id, date, impressions, clicks, spend, conversions,
                revenue, reach, ctr, cpc, roas
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (campaign_id, date) DO UPDATE SET
                impressions = EXCLUDED.impressions,
                clicks = EXCLUDED.clicks,
                spend = EXCLUDED.spend,
                conversions = EXCLUDED.conversions,
                revenue = EXCLUDED.revenue,
                reach = EXCLUDED.reach,
                ctr = EXCLUDED.ctr,
                cpc = EXCLUDED.cpc,
                roas = EXCLUDED.roas
        `, [
            campaignId, date,
            metrics.impressions || 0, metrics.clicks || 0,
            metrics.spend || 0, metrics.conversions || 0,
            metrics.revenue || 0, metrics.reach || 0,
            metrics.ctr || 0, metrics.cpc || 0, metrics.roas || 0,
        ]);
    }

    /**
     * Mock sync — generates realistic-looking metrics for demo
     * (Real API sync comes in Sprint 6/7 when Meta API tokens are added)
     */
    static async mockSync(campaignId, agencyId) {
        const campaign = await CampaignService.getCampaignById(campaignId, agencyId);
        if (!campaign) return null;

        const today = new Date();
        let generated = 0;

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            // Generate realistic mock numbers with some variance
            const base = campaign.platform === 'meta' ? 1200 : 900;
            const impressions = Math.floor(base * (0.8 + Math.random() * 0.5));
            const clicks      = Math.floor(impressions * (0.02 + Math.random() * 0.03));
            const spend       = parseFloat((clicks * (8 + Math.random() * 5)).toFixed(2));
            const conversions = Math.floor(clicks * (0.04 + Math.random() * 0.06));
            const revenue     = parseFloat((conversions * (450 + Math.random() * 300)).toFixed(2));
            const roas        = spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0;
            const ctr         = impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(4)) : 0;
            const cpc         = clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0;

            await CampaignService.upsertMetrics(campaignId, dateStr, {
                impressions, clicks, spend, conversions, revenue,
                reach: Math.floor(impressions * 0.85), roas, ctr, cpc,
            });
            generated++;
        }

        logger.info(`✅ Mock sync complete: ${generated} days for campaign ${campaignId}`);
        return { daysGenerated: generated, campaignId };
    }
}

module.exports = CampaignService;

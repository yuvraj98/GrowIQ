// src/services/insight.service.js
const { query } = require('../config/db');
const logger = require('../utils/logger');
const NotificationService = require('./notification.service');

class InsightService {
    /**
     * Fetch insights for a specific client or all clients in an agency
     */
    static async getInsights(agencyId, clientId = null, limit = 50) {
        let sql = `
            SELECT i.id, i.client_id, i.type, i.severity, i.title, i.description, i.data,
                   i.is_actioned, i.is_dismissed, i.created_at,
                   c.business_name as client_name
            FROM ai_insights i
            JOIN clients c ON i.client_id = c.id
            WHERE c.agency_id = $1 AND i.is_dismissed = false
        `;
        const params = [agencyId];

        if (clientId) {
            params.push(clientId);
            sql += ` AND i.client_id = $2`;
        }

        sql += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Core AI Engine Generation
     * Iterates over a client's campaigns and generates rule-based insights
     * (Pre-LLM processing step for Sprint 8)
     */
    static async generateInsightsForClient(clientId, agencyId) {
        logger.info(`🤖 Running AI Engine (Mock Mode) for client ${clientId}...`);
        
        // 1. Fetch campaigns & latest performance data
        const campaignsResult = await query(`
            SELECT c.id, c.name, c.platform, c.status,
                   COALESCE(SUM(m.spend), 0) as total_spend,
                   COALESCE(SUM(m.conversions), 0) as total_conversions,
                   COALESCE(AVG(m.roas), 0) as avg_roas
            FROM campaigns c
            LEFT JOIN campaign_metrics m ON c.id = m.campaign_id AND m.date >= CURRENT_DATE - INTERVAL '7 days'
            WHERE c.client_id = $1 AND c.status = 'active'
            GROUP BY c.id
        `, [clientId]);

        const campaigns = campaignsResult.rows;
        let generatedCount = 0;

        for (const camp of campaigns) {
            const roas = parseFloat(camp.avg_roas);
            const spend = parseFloat(camp.total_spend);

            // Mock Intelligence Rule 1: High potential opportunity
            if (roas > 4.5 && spend > 0) {
                await this.createInsight(
                    clientId, 
                    'opportunity', 
                    'high', 
                    `Scale winning campaign: ${camp.name}`,
                    `This campaign has maintained an outstanding ROAS of ${roas.toFixed(2)}x over the last 7 days. Increasing daily budget by 15-20% is recommended.`,
                    { campaignId: camp.id, suggestedBudgetIncrease: '20%' }
                );
                generatedCount++;
            }
            
            // Mock Intelligence Rule 2: Alert for low performance
            if (roas > 0 && roas < 1.5 && spend > 1000) {
                await this.createInsight(
                    clientId, 
                    'alert', 
                    'critical', 
                    `Underperforming campaign: ${camp.name}`,
                    `ROAS has dropped to ${roas.toFixed(2)}x despite high spend (₹${spend.toFixed(0)} in 7 days). Consider pausing or revising targeting.`,
                    { campaignId: camp.id, currentRoas: roas }
                );
                generatedCount++;
            }
        }

        // Mock Intelligence Rule 3: Client macro forecast
        if (campaigns.length > 0) {
            await this.createInsight(
                clientId,
                'forecast',
                'medium',
                'Projected Lead Volume Increase',
                'Based on seasonal search trends and current CTR trajectories, we forecast a 12% increase in conversions next week.',
                { type: 'positive_trend' }
            );
            generatedCount++;
        }

        logger.info(`✅ Generated ${generatedCount} insights for client ${clientId}`);
        return { success: true, count: generatedCount };
    }

    /**
     * Utility to create an insight, avoiding duplicates
     */
    static async createInsight(clientId, type, severity, title, description, data) {
        // Prevent spamming the exact same active insight title within the last 3 days
        const check = await query(`
            SELECT id FROM ai_insights
            WHERE client_id = $1 AND title = $2 AND is_actioned = false AND is_dismissed = false
              AND created_at >= CURRENT_DATE - INTERVAL '3 days'
        `, [clientId, title]);

        if (check.rows.length > 0) return null; // Already exists and is active

        const result = await query(`
            INSERT INTO ai_insights (client_id, type, severity, title, description, data)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, type, title
        `, [clientId, type, severity, title, description, JSON.stringify(data)]);
        
        return result.rows[0];
    }

    /**
     * Mark insight as actioned
     */
    static async markActioned(insightId, agencyId) {
        // Verify agency ownership via join
        const verify = await query(`
            SELECT i.id FROM ai_insights i
            JOIN clients c ON i.client_id = c.id
            WHERE i.id = $1 AND c.agency_id = $2
        `, [insightId, agencyId]);

        if (!verify.rows.length) throw new Error('Insight not found');

        const result = await query(`
            UPDATE ai_insights SET is_actioned = true, updated_at = NOW() WHERE id = $1 RETURNING *
        `, [insightId]);
        return result.rows[0];
    }

    /**
     * Mark insight as dismissed
     */
    static async markDismissed(insightId, agencyId) {
        const verify = await query(`
            SELECT i.id FROM ai_insights i
            JOIN clients c ON i.client_id = c.id
            WHERE i.id = $1 AND c.agency_id = $2
        `, [insightId, agencyId]);

        if (!verify.rows.length) throw new Error('Insight not found');

        const result = await query(`
            UPDATE ai_insights SET is_dismissed = true, updated_at = NOW() WHERE id = $1 RETURNING *
        `, [insightId]);
        return result.rows[0];
    }
}

module.exports = InsightService;

// src/services/dashboard.service.js
const { query } = require('../config/db');

class DashboardService {
    static async getDashboardOverview(agencyId) {
        // 1. Get active clients and their retainers
        const clientQuery = `
            SELECT 
                COUNT(*) as active_clients,
                SUM(monthly_retainer) as total_revenue,
                AVG(health_score) as avg_health
            FROM clients
            WHERE agency_id = $1 AND status = 'active' AND is_archived = false
        `;
        const clientResult = await query(clientQuery, [agencyId]);
        
        const activeClients = parseInt(clientResult.rows[0].active_clients) || 0;
        const totalRevenue = parseFloat(clientResult.rows[0].total_revenue) || 0;
        const avgHealth = Math.round(parseFloat(clientResult.rows[0].avg_health)) || 0;

        // 2. Get live campaigns (Mock 0 until Sprint 5/6)
        const campaignQuery = `
            SELECT COUNT(*) as live_campaigns
            FROM campaigns c
            JOIN clients cl ON c.client_id = cl.id
            WHERE cl.agency_id = $1 AND c.status = 'active'
        `;
        const campaignResult = await query(campaignQuery, [agencyId]);
        const liveCampaigns = parseInt(campaignResult.rows[0].live_campaigns) || 0;

        // 3. Avg ROAS from last 7 days across all active campaigns
        const roasQuery = `
            SELECT COALESCE(AVG(m.roas), 0) as avg_roas
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.id
            JOIN clients cl ON c.client_id = cl.id
            WHERE cl.agency_id = $1 AND c.status = 'active'
              AND m.date >= CURRENT_DATE - INTERVAL '7 days'
        `;
        const roasResult = await query(roasQuery, [agencyId]);
        const avgRoas = parseFloat(parseFloat(roasResult.rows[0].avg_roas || 0).toFixed(2));

        // 4. Get recent AI Insights (Sprint 8/9 logic)
        const insightsQuery = `
            SELECT i.id, i.type, i.severity, i.title, i.created_at
            FROM ai_insights i
            JOIN clients c ON i.client_id = c.id
            WHERE c.agency_id = $1 AND i.is_actioned = false AND i.is_dismissed = false
            ORDER BY i.created_at DESC
            LIMIT 3
        `;
        const insightsResult = await query(insightsQuery, [agencyId]);
        const recentInsights = insightsResult.rows;

        return {
            totalRevenue,
            activeClients,
            liveCampaigns,
            avgRoas,
            healthScore: avgHealth,
            recentInsights
        };
    }
}

module.exports = DashboardService;

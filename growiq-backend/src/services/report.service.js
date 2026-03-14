// src/services/report.service.js
const { query } = require('../config/db');
const logger = require('../utils/logger');

class ReportService {
    /**
     * Get reports for a specific client or all clients in an agency
     */
    static async getReports(agencyId, clientId = null, limit = 50) {
        let sql = `
            SELECT r.*, c.business_name as client_name
            FROM reports r
            JOIN clients c ON r.client_id = c.id
            WHERE c.agency_id = $1
        `;
        const params = [agencyId];

        if (clientId) {
            params.push(clientId);
            sql += ` AND r.client_id = $2`;
        }

        sql += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Generate a performance report for a client
     */
    static async generateReport(clientId, agencyId, periodStart, periodEnd) {
        logger.info(`📊 Generating report for client ${clientId} (${periodStart} to ${periodEnd})...`);

        // 1. Fetch metrics summary for the period
        const metricsResult = await query(`
            SELECT 
                COALESCE(SUM(m.spend), 0) as total_spend,
                COALESCE(SUM(m.conversions), 0) as total_conversions,
                COALESCE(AVG(m.roas), 0) as avg_roas,
                COALESCE(SUM(m.clicks), 0) as total_clicks,
                COALESCE(SUM(m.impressions), 0) as total_impressions
            FROM campaign_metrics m
            JOIN campaigns c ON m.campaign_id = c.id
            WHERE c.client_id = $1 AND m.date BETWEEN $2 AND $3
        `, [clientId, periodStart, periodEnd]);

        const metrics = metricsResult.rows[0];
        const roas = parseFloat(metrics.avg_roas).toFixed(2);
        
        // 2. Generate a mock AI summary
        const aiSummary = `During this period, the campaigns achieved a total ROAS of ${roas}x with ${metrics.total_conversions} conversions. Total spend was ₹${parseFloat(metrics.total_spend).toLocaleString()}. Performance is ${roas > 3 ? 'healthy' : 'stable'}, with opportunities identified in search scaling.`;

        // 3. Save report to database
        const title = `Performance Report: ${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()}`;
        
        const result = await query(`
            INSERT INTO reports (client_id, title, period_start, period_end, ai_summary, status)
            VALUES ($1, $2, $3, $4, $5, 'generated')
            RETURNING *
        `, [clientId, title, periodStart, periodEnd, aiSummary]);

        return result.rows[0];
    }

    /**
     * Delete a report
     */
    static async deleteReport(reportId, agencyId) {
        const verify = await query(`
            SELECT r.id FROM reports r
            JOIN clients c ON r.client_id = c.id
            WHERE r.id = $1 AND c.agency_id = $2
        `, [reportId, agencyId]);

        if (!verify.rows.length) throw new Error('Report not found');

        await query('DELETE FROM reports WHERE id = $1', [reportId]);
    }
}

module.exports = ReportService;

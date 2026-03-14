// src/controllers/report.controller.js
const ReportService = require('../services/report.service');

class ReportController {
    /**
     * GET /api/v1/reports
     * GET /api/v1/reports?clientId=123
     */
    static async getReports(req, res, next) {
        try {
            const { clientId, limit } = req.query;
            const reports = await ReportService.getReports(
                req.user.agencyId,
                clientId || null,
                parseInt(limit) || 50
            );
            res.json({ success: true, data: reports });
        } catch (err) { next(err); }
    }

    /**
     * POST /api/v1/reports/:clientId/generate
     */
    static async generateReport(req, res, next) {
        try {
            const { periodStart, periodEnd } = req.body;
            // Default to last 30 days if not provided
            const end = periodEnd || new Date().toISOString().split('T')[0];
            const start = periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

            const report = await ReportService.generateReport(
                req.params.clientId,
                req.user.agencyId,
                start,
                end
            );
            res.status(201).json({ success: true, data: report });
        } catch (err) { next(err); }
    }

    /**
     * DELETE /api/v1/reports/:id
     */
    static async deleteReport(req, res, next) {
        try {
            await ReportService.deleteReport(req.params.id, req.user.agencyId);
            res.json({ success: true, message: 'Report deleted' });
        } catch (err) {
            if (err.message === 'Report not found') return res.status(404).json({ success: false, error: err.message });
            next(err);
        }
    }
}

module.exports = ReportController;

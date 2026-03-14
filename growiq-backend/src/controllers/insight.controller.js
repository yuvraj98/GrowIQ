// src/controllers/insight.controller.js
const InsightService = require('../services/insight.service');
const logger = require('../utils/logger');

class InsightController {
    /**
     * GET /insights
     * GET /insights?clientId=123
     */
    static async getInsights(req, res, next) {
        try {
            const { clientId, limit } = req.query;
            const rows = await InsightService.getInsights(
                req.user.agencyId,
                clientId || null,
                parseInt(limit) || 50
            );
            res.json({ success: true, data: rows });
        } catch (err) {
            next(err);
        }
    }

    /**
     * POST /insights/:clientId/generate
     * Manually trigger the AI insight generation
     */
    static async generateInsights(req, res, next) {
        try {
            const result = await InsightService.generateInsightsForClient(req.params.clientId, req.user.agencyId);
            res.status(200).json({ success: true, message: `Completed insight generation. Found ${result.count} insights.` });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PATCH /insights/:id/action
     * Mark an insight as actioned
     */
    static async actionInsight(req, res, next) {
        try {
            const insight = await InsightService.markActioned(req.params.id, req.user.agencyId);
            res.json({ success: true, data: insight });
        } catch (err) {
            if (err.message === 'Insight not found') {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
            }
            next(err);
        }
    }

    /**
     * PATCH /insights/:id/dismiss
     * Mark an insight as dismissed
     */
    static async dismissInsight(req, res, next) {
        try {
            const insight = await InsightService.markDismissed(req.params.id, req.user.agencyId);
            res.json({ success: true, data: insight });
        } catch (err) {
            if (err.message === 'Insight not found') {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
            }
            next(err);
        }
    }
}

module.exports = InsightController;

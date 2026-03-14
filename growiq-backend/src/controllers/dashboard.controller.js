// src/controllers/dashboard.controller.js
const DashboardService = require('../services/dashboard.service');
const logger = require('../utils/logger');

class DashboardController {
    /**
     * @route GET /api/v1/dashboard/overview
     * @desc Get aggregated metrics for agency dashboard
     */
    static async getOverview(req, res, next) {
        try {
            const metrics = await DashboardService.getDashboardOverview(req.user.agencyId);
            res.json({ success: true, data: metrics });
        } catch (error) {
            logger.error('Get dashboard overview error:', error);
            next(error);
        }
    }
}

module.exports = DashboardController;

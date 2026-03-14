// src/controllers/portal.controller.js
const PortalService = require('../services/portal.service');

class PortalController {
    /**
     * GET /api/v1/portal/summary
     */
    static async getSummary(req, res, next) {
        try {
            // Clients use their authenticated ID. If an agency user is viewing the portal, they must provide a clientId.
            const clientId = req.user.role === 'client' ? req.user.clientId : req.query.clientId;
            
            if (!clientId) return res.status(400).json({ success: false, error: { message: 'Client ID required' }});

            const summary = await PortalService.getPortalSummary(clientId);
            res.json({ success: true, data: summary });
        } catch (err) { next(err); }
    }

    /**
     * GET /api/v1/portal/reports
     */
    static async getReports(req, res, next) {
        try {
            const clientId = req.user.role === 'client' ? req.user.clientId : req.query.clientId;
            if (!clientId) return res.status(400).json({ success: false, error: { message: 'Client ID required' }});

            const reports = await PortalService.getPortalReports(clientId);
            res.json({ success: true, data: reports });
        } catch (err) { next(err); }
    }
}

module.exports = PortalController;

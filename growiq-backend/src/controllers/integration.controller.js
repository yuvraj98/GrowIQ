// src/controllers/integration.controller.js
const Joi = require('joi');
const { IntegrationService } = require('../services/integration.service');
const logger = require('../utils/logger');

class IntegrationController {
    /** GET /integrations/:clientId — status summary */
    static async getStatus(req, res, next) {
        try {
            const summary = await IntegrationService.getStatusSummary(req.params.clientId, req.user.agencyId);
            res.json({ success: true, data: summary });
        } catch (err) {
            if (err.message === 'Client not found') {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
            }
            next(err);
        }
    }

    /** POST /integrations/:clientId/connect — connect a platform */
    static async connect(req, res, next) {
        try {
            const schema = Joi.object({
                platform: Joi.string().valid('meta', 'google_ads', 'ga4', 'search_console', 'instagram').required(),
                access_token: Joi.string().allow('', null),
                refresh_token: Joi.string().allow('', null),
                account_id: Joi.string().max(255).allow('', null),
                token_expires_at: Joi.date().allow(null),
            });
            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
            }

            const integration = await IntegrationService.connect(req.params.clientId, req.user.agencyId, value);
            res.status(201).json({ success: true, data: integration });
        } catch (err) {
            if (err.message === 'Client not found') {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
            }
            next(err);
        }
    }

    /** DELETE /integrations/:clientId/:platform — disconnect */
    static async disconnect(req, res, next) {
        try {
            const result = await IntegrationService.disconnect(
                req.params.clientId,
                req.user.agencyId,
                req.params.platform
            );
            res.json({ success: true, message: `${req.params.platform} disconnected`, data: result });
        } catch (err) {
            if (err.message.includes('not found')) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
            }
            next(err);
        }
    }
}

module.exports = IntegrationController;

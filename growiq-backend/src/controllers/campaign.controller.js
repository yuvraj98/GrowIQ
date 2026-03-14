// src/controllers/campaign.controller.js
const Joi = require('joi');
const CampaignService = require('../services/campaign.service');
const logger = require('../utils/logger');

class CampaignController {
    /** GET /campaigns */
    static async listCampaigns(req, res, next) {
        try {
            const { clientId, platform, status, page, limit } = req.query;
            const result = await CampaignService.listCampaigns(req.user.agencyId, {
                clientId, platform, status,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
            });
            res.json({ success: true, data: result });
        } catch (err) {
            next(err);
        }
    }

    /** GET /campaigns/:id */
    static async getCampaign(req, res, next) {
        try {
            const campaign = await CampaignService.getCampaignById(req.params.id, req.user.agencyId);
            if (!campaign) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
            }
            res.json({ success: true, data: campaign });
        } catch (err) {
            next(err);
        }
    }

    /** POST /campaigns */
    static async createCampaign(req, res, next) {
        try {
            const schema = Joi.object({
                client_id: Joi.string().uuid().required(),
                platform: Joi.string().valid('meta', 'google_ads').required(),
                name: Joi.string().max(255).required(),
                objective: Joi.string().max(100).allow('', null),
                status: Joi.string().valid('active', 'paused', 'completed', 'draft').default('active'),
                budget_total: Joi.number().min(0).allow(null),
                budget_daily: Joi.number().min(0).allow(null),
                start_date: Joi.date().allow(null),
                end_date: Joi.date().allow(null),
                platform_campaign_id: Joi.string().max(255).allow('', null),
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
            }

            const campaign = await CampaignService.createCampaign(req.user.agencyId, value);
            res.status(201).json({ success: true, data: campaign });
        } catch (err) {
            if (err.message === 'Client not found or unauthorized') {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
            }
            next(err);
        }
    }

    /** PUT /campaigns/:id */
    static async updateCampaign(req, res, next) {
        try {
            const schema = Joi.object({
                name: Joi.string().max(255),
                status: Joi.string().valid('active', 'paused', 'completed', 'draft'),
                budget_total: Joi.number().min(0).allow(null),
                budget_daily: Joi.number().min(0).allow(null),
                objective: Joi.string().max(100).allow('', null),
                start_date: Joi.date().allow(null),
                end_date: Joi.date().allow(null),
            }).min(1);

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.details[0].message } });
            }

            const campaign = await CampaignService.updateCampaign(req.params.id, req.user.agencyId, value);
            if (!campaign) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
            }
            res.json({ success: true, data: campaign });
        } catch (err) {
            next(err);
        }
    }

    /** POST /campaigns/:id/sync */
    static async syncCampaign(req, res, next) {
        try {
            const result = await CampaignService.mockSync(req.params.id, req.user.agencyId);
            if (!result) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
            }
            res.json({ success: true, message: `Synced ${result.daysGenerated} days of metrics`, data: result });
        } catch (err) {
            next(err);
        }
    }

    /** GET /campaigns/:id/metrics */
    static async getCampaignMetrics(req, res, next) {
        try {
            const campaign = await CampaignService.getCampaignById(req.params.id, req.user.agencyId);
            if (!campaign) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
            }
            res.json({ success: true, data: { metrics: campaign.metrics } });
        } catch (err) {
            next(err);
        }
    }
}

module.exports = CampaignController;

// src/controllers/client.controller.js
const Joi = require('joi');
const ClientService = require('../services/client.service');
const logger = require('../utils/logger');

class ClientController {
    /**
     * @route GET /api/v1/clients
     */
    static async listClients(req, res, next) {
        try {
            const { page, limit, search, status, sortBy, sortOrder } = req.query;

            const result = await ClientService.listClients(req.user.agencyId, {
                page: parseInt(page, 10) || 1,
                limit: parseInt(limit, 10) || 10,
                search: search || '',
                status: status || '',
                sortBy: sortBy || 'created_at',
                sortOrder: sortOrder || 'DESC',
            });

            res.json({ success: true, data: result });
        } catch (error) {
            logger.error('List clients error:', error);
            next(error);
        }
    }

    /**
     * @route GET /api/v1/clients/:id
     */
    static async getClient(req, res, next) {
        try {
            const client = await ClientService.getClientById(req.params.id, req.user.agencyId);

            if (!client) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Client not found' },
                });
            }

            res.json({ success: true, data: client });
        } catch (error) {
            logger.error('Get client error:', error);
            next(error);
        }
    }

    /**
     * @route POST /api/v1/clients
     */
    static async createClient(req, res, next) {
        try {
            const schema = Joi.object({
                business_name: Joi.string().required().max(255),
                contact_name: Joi.string().max(255).allow('', null),
                contact_email: Joi.string().email().allow('', null),
                contact_phone: Joi.string().max(50).allow('', null),
                industry: Joi.string().max(100).allow('', null),
                website: Joi.string().max(255).allow('', null),
                gst_number: Joi.string().max(20).allow('', null),
                plan: Joi.string().valid('starter', 'growth', 'premium').default('starter'),
                monthly_retainer: Joi.number().min(0).default(0),
                contract_start: Joi.date().allow(null),
                contract_end: Joi.date().allow(null),
                notes: Joi.string().allow('', null),
            });

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: error.details[0].message },
                });
            }

            const client = await ClientService.createClient(req.user.agencyId, value);

            res.status(201).json({ success: true, data: client });
        } catch (error) {
            logger.error('Create client error:', error);
            next(error);
        }
    }

    /**
     * @route PUT /api/v1/clients/:id
     */
    static async updateClient(req, res, next) {
        try {
            const schema = Joi.object({
                business_name: Joi.string().max(255),
                contact_name: Joi.string().max(255).allow('', null),
                contact_email: Joi.string().email().allow('', null),
                contact_phone: Joi.string().max(50).allow('', null),
                industry: Joi.string().max(100).allow('', null),
                website: Joi.string().max(255).allow('', null),
                gst_number: Joi.string().max(20).allow('', null),
                plan: Joi.string().valid('starter', 'growth', 'premium'),
                monthly_retainer: Joi.number().min(0),
                contract_start: Joi.date().allow(null),
                contract_end: Joi.date().allow(null),
                status: Joi.string().valid('active', 'paused', 'churned'),
                notes: Joi.string().allow('', null),
            }).min(1);

            const { error, value } = schema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    error: { code: 'VALIDATION_ERROR', message: error.details[0].message },
                });
            }

            const client = await ClientService.updateClient(req.params.id, req.user.agencyId, value);

            if (!client) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Client not found' },
                });
            }

            res.json({ success: true, data: client });
        } catch (error) {
            logger.error('Update client error:', error);
            next(error);
        }
    }

    /**
     * @route DELETE /api/v1/clients/:id
     */
    static async archiveClient(req, res, next) {
        try {
            const result = await ClientService.archiveClient(req.params.id, req.user.agencyId);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Client not found' },
                });
            }

            res.json({
                success: true,
                message: `Client "${result.business_name}" archived successfully`,
            });
        } catch (error) {
            logger.error('Archive client error:', error);
            next(error);
        }
    }
}

module.exports = ClientController;

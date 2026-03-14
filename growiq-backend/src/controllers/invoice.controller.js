// src/controllers/invoice.controller.js
const InvoiceService = require('../services/invoice.service');
const logger = require('../utils/logger');

class InvoiceController {
    /**
     * GET /api/v1/invoices
     */
    static async getInvoices(req, res, next) {
        try {
            const invoices = await InvoiceService.getInvoices(req.user.agencyId, req.query.status);
            res.json({ success: true, data: invoices });
        } catch (err) { next(err); }
    }

    /**
     * GET /api/v1/invoices/:id
     */
    static async getInvoice(req, res, next) {
        try {
            const invoice = await InvoiceService.getInvoice(req.user.agencyId, req.params.id);
            res.json({ success: true, data: invoice });
        } catch (err) { 
            if (err.message === 'Invoice not found') return res.status(404).json({ success: false, error: err.message });
            next(err); 
        }
    }

    /**
     * POST /api/v1/invoices
     */
    static async createInvoice(req, res, next) {
        try {
            const { clientId, amount, notes, dueDate } = req.body;
            if (!clientId || !amount) {
                return res.status(400).json({ success: false, error: { message: 'Client ID and amount are required' }});
            }

            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                return res.status(400).json({ success: false, error: { message: 'Amount must be greater than zero' }});
            }

            const invoice = await InvoiceService.createInvoice(
                req.user.agencyId, 
                clientId, 
                parsedAmount, 
                notes, 
                dueDate
            );
            
            res.status(201).json({ success: true, data: invoice });
        } catch (err) { next(err); }
    }

    /**
     * PATCH /api/v1/invoices/:id/pay
     * Developer endpoint to mock payment success
     */
    static async markPaid(req, res, next) {
        try {
            const { method } = req.body;
            const invoice = await InvoiceService.markPaid(req.user.agencyId, req.params.id, method);
            res.json({ success: true, data: invoice, message: 'Invoice marked as paid successfully' });
        } catch (err) {
            if (err.message === 'Invoice not found') return res.status(404).json({ success: false, error: err.message });
            next(err);
        }
    }
}

module.exports = InvoiceController;

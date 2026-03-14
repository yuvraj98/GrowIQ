// src/services/invoice.service.js
const { query } = require('../config/db');
const logger = require('../utils/logger');
// const Razorpay = require('razorpay');

class InvoiceService {
    /**
     * Get all invoices for an agency, optionally filtered by status
     */
    static async getInvoices(agencyId, status = null) {
        let sql = `
            SELECT i.id, i.invoice_number, i.amount, i.total_amount, i.status, i.due_date, i.paid_at,
                   c.business_name as client_name, c.id as client_id
            FROM invoices i
            JOIN clients c ON i.client_id = c.id
            WHERE i.agency_id = $1
        `;
        const params = [agencyId];

        if (status) {
            params.push(status);
            sql += ` AND i.status = $2`;
        }

        sql += ` ORDER BY i.created_at DESC`;
        
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Get a single invoice details
     */
    static async getInvoice(agencyId, invoiceId) {
        const sql = `
            SELECT i.*, 
                   c.business_name, c.email, c.phone, c.address, c.monthly_retainer,
                   a.name as agency_name
            FROM invoices i
            JOIN clients c ON i.client_id = c.id
            JOIN agencies a ON i.agency_id = a.id
            WHERE i.id = $1 AND i.agency_id = $2
        `;
        const result = await query(sql, [invoiceId, agencyId]);
        if (!result.rows.length) throw new Error('Invoice not found');
        return result.rows[0];
    }

    /**
     * Create a new manual invoice
     */
    static async createInvoice(agencyId, clientId, amount, notes, dueDate) {
        // Generate an invoice number (Format: INV-XXXX)
        const countRes = await query(`SELECT count(*) FROM invoices WHERE agency_id = $1`, [agencyId]);
        const invoiceCount = parseInt(countRes.rows[0].count) + 1;
        const invoiceNumber = `INV-${invoiceCount.toString().padStart(4, '0')}`;

        // Simplified tax calculation (18% GST mock)
        const taxAmount = amount * 0.18;
        const totalAmount = amount + taxAmount;

        const result = await query(`
            INSERT INTO invoices (client_id, agency_id, invoice_number, amount, tax_amount, total_amount, status, due_date, notes)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
            RETURNING id, invoice_number, total_amount, status, due_date
        `, [clientId, agencyId, invoiceNumber, amount, taxAmount, totalAmount, dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), notes]);
        
        return result.rows[0];
    }

    /**
     * Mark an invoice as Paid (Mocking successful webhook)
     */
    static async markPaid(agencyId, invoiceId, method = 'manual_transfer') {
        const result = await query(`
            UPDATE invoices SET status = 'paid', paid_at = NOW(), updated_at = NOW()
            WHERE id = $1 AND agency_id = $2
            RETURNING id, invoice_number, status, total_amount
        `, [invoiceId, agencyId]);

        if (!result.rows.length) throw new Error('Invoice not found');
        
        // Log payment record
        await query(`
            INSERT INTO payments (invoice_id, amount, method, status)
            VALUES ($1, $2, $3, 'captured')
        `, [invoiceId, result.rows[0].total_amount, method]);

        return result.rows[0];
    }
}

module.exports = InvoiceService;

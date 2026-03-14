// src/routes/invoice.routes.js
const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/invoice.controller');
const { authorize } = require('../middleware/auth');

router.get('/', authorize('owner', 'manager', 'finance', 'viewer'), InvoiceController.getInvoices);
router.get('/:id', authorize('owner', 'manager', 'finance', 'viewer'), InvoiceController.getInvoice);
router.post('/', authorize('owner', 'finance'), InvoiceController.createInvoice);
router.patch('/:id/pay', authorize('owner', 'finance'), InvoiceController.markPaid);

module.exports = router;

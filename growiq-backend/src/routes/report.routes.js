// src/routes/report.routes.js
const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authorize } = require('../middleware/auth');

router.get('/', authorize('owner', 'manager', 'viewer'), ReportController.getReports);
router.post('/:clientId/generate', authorize('owner', 'manager'), ReportController.generateReport);
router.delete('/:id', authorize('owner', 'manager'), ReportController.deleteReport);

module.exports = router;

// src/routes/portal.routes.js
const express = require('express');
const router = express.Router();
const PortalController = require('../controllers/portal.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Portal endpoints are accessible to clients and agency staff
router.get('/summary', PortalController.getSummary);
router.get('/reports', PortalController.getReports);

module.exports = router;

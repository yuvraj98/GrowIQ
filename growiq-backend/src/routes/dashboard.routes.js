// src/routes/dashboard.routes.js
// Sprint 4 — Dashboard Metrics
const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboard.controller');
const { authorize } = require('../middleware/auth');

// GET /dashboard/overview
router.get('/overview', authorize('owner', 'manager', 'viewer'), DashboardController.getOverview);

module.exports = router;

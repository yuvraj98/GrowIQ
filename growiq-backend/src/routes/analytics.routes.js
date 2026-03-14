// src/routes/analytics.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// GET /analytics/revenue — Agency revenue analytics
router.get('/revenue', authorize('owner'), (req, res) => {
    res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Coming in Sprint 15' } });
});

// GET /analytics/health — Agency health score
router.get('/health', authorize('owner'), (req, res) => {
    res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Coming in Sprint 15' } });
});

module.exports = router;

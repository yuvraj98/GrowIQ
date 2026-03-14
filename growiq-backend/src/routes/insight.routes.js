// src/routes/insight.routes.js
const express = require('express');
const router = express.Router();
const InsightController = require('../controllers/insight.controller');
const { authorize } = require('../middleware/auth');

// Note: mounted in app.js as app.use('/api/v1/insights', authenticate, insightRoutes)

router.get('/', authorize('owner', 'manager', 'viewer'), InsightController.getInsights);
router.post('/:clientId/generate', authorize('owner', 'manager'), InsightController.generateInsights);
router.patch('/:id/action', authorize('owner', 'manager'), InsightController.actionInsight);
router.patch('/:id/dismiss', authorize('owner', 'manager'), InsightController.dismissInsight);

module.exports = router;

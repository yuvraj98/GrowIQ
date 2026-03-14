// src/routes/webhook.routes.js
const express = require('express');
const router = express.Router();

// POST /webhooks/razorpay — Payment webhook
router.post('/razorpay', express.raw({ type: 'application/json' }), (req, res) => {
    // TODO: Sprint 11 — verify Razorpay webhook signature and process payment
    res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Coming in Sprint 11' } });
});

module.exports = router;

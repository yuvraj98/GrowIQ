// src/routes/social.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/:clientId', authorize('owner', 'manager'), (req, res) => {
    res.status(501).json({ success: false, error: { code: 'NOT_IMPLEMENTED', message: 'Coming in Sprint 13' } });
});

module.exports = router;

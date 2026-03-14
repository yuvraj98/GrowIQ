// src/routes/integration.routes.js — Sprint 6
const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const IntegrationController = require('../controllers/integration.controller');

// GET  /integrations/:clientId         — get all platform statuses
router.get('/:clientId', authorize('owner', 'manager', 'viewer'), IntegrationController.getStatus);

// POST /integrations/:clientId/connect — connect a platform (dev: pass any token)
router.post('/:clientId/connect', authorize('owner', 'manager'), IntegrationController.connect);

// DELETE /integrations/:clientId/:platform — disconnect
router.delete('/:clientId/:platform', authorize('owner', 'manager'), IntegrationController.disconnect);

module.exports = router;

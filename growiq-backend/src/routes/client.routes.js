// src/routes/client.routes.js
// Client management routes — Sprint 3
const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const ClientController = require('../controllers/client.controller');

// GET /clients — List all clients for agency
router.get('/', authorize('owner', 'manager', 'viewer'), ClientController.listClients);

// POST /clients — Create new client
router.post('/', authorize('owner', 'manager'), ClientController.createClient);

// GET /clients/:id — Get client details
router.get('/:id', authorize('owner', 'manager', 'viewer'), ClientController.getClient);

// PUT /clients/:id — Update client
router.put('/:id', authorize('owner', 'manager'), ClientController.updateClient);

// DELETE /clients/:id — Archive client (soft delete)
router.delete('/:id', authorize('owner'), ClientController.archiveClient);

// POST /clients/:id/connect/meta — Connect Meta Ads (Sprint 5)
router.post('/:id/connect/meta', authorize('manager', 'owner'), (req, res) => {
    res.status(501).json({
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Coming in Sprint 5' },
    });
});

// POST /clients/:id/connect/google — Connect Google Ads (Sprint 6)
router.post('/:id/connect/google', authorize('manager', 'owner'), (req, res) => {
    res.status(501).json({
        success: false,
        error: { code: 'NOT_IMPLEMENTED', message: 'Coming in Sprint 6' },
    });
});

module.exports = router;

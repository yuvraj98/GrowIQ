// src/routes/campaign.routes.js — Sprint 5
const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const CampaignController = require('../controllers/campaign.controller');

// GET /campaigns
router.get('/', authorize('owner', 'manager', 'viewer'), CampaignController.listCampaigns);

// POST /campaigns
router.post('/', authorize('owner', 'manager'), CampaignController.createCampaign);

// GET /campaigns/:id
router.get('/:id', authorize('owner', 'manager', 'viewer'), CampaignController.getCampaign);

// PUT /campaigns/:id
router.put('/:id', authorize('owner', 'manager'), CampaignController.updateCampaign);

// GET /campaigns/:id/metrics
router.get('/:id/metrics', authorize('owner', 'manager', 'viewer'), CampaignController.getCampaignMetrics);

// POST /campaigns/:id/sync — Mock sync for demo (real sync in Sprint 7)
router.post('/:id/sync', authorize('owner', 'manager'), CampaignController.syncCampaign);

module.exports = router;

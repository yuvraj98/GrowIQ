// src/integrations/metaAds.js
// Meta Ads API integration — Sprint 5
const env = require('../config/env');
const logger = require('../utils/logger');

async function fetchMetaCampaigns(token, adAccountId) {
    if (env.USE_MOCK_APIS) {
        logger.info('[Mock] Fetching Meta campaigns — returning sample data');
        return require('../mocks/metaCampaigns.json');
    }
    // TODO: Sprint 5 — Real Meta API implementation
    throw new Error('Meta Ads integration not yet implemented');
}

module.exports = { fetchMetaCampaigns };

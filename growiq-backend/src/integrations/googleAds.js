// src/integrations/googleAds.js
// Google Ads API integration — Sprint 6
const env = require('../config/env');
const logger = require('../utils/logger');

async function fetchGoogleCampaigns(token, customerId) {
    if (env.USE_MOCK_APIS) {
        logger.info('[Mock] Fetching Google campaigns — returning sample data');
        return require('../mocks/googleCampaigns.json');
    }
    throw new Error('Google Ads integration not yet implemented');
}

module.exports = { fetchGoogleCampaigns };

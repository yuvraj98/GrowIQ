// src/services/aiService.js
// AI Service — toggles between mock and real Claude API
const env = require('../config/env');
const logger = require('../utils/logger');

/**
 * Generate AI insights for a client
 * Uses mock data in development, Claude API in production
 */
async function generateClientInsights(clientId, campaignData, historicalData) {
    if (env.AI_SERVICE_MODE === 'live') {
        return require('./realAiService').generateClientInsights(clientId, campaignData, historicalData);
    }
    return require('./mockAiService').generateClientInsights(clientId, campaignData, historicalData);
}

module.exports = { generateClientInsights };

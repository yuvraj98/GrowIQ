// src/integrations/semrush.js
const env = require('../config/env');
const logger = require('../utils/logger');
async function fetchKeywordRankings(domain, keywords) {
    if (env.USE_MOCK_APIS) {
        logger.info('[Mock] Fetching SEMrush keyword rankings');
        return keywords.map((kw, i) => ({ keyword: kw, position: 5 + i * 3, change: Math.floor(Math.random() * 5) - 2 }));
    }
    throw new Error('SEMrush integration not yet implemented');
}
module.exports = { fetchKeywordRankings };

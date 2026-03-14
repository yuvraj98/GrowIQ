// src/jobs/runAIAnalysis.job.js
const cron = require('node-cron');
const { query } = require('../config/db');
const InsightService = require('../services/insight.service');
const logger = require('../utils/logger');

class AIAnalysisJob {
    static init() {
        // Run every night at 2:00 AM
        cron.schedule('0 2 * * *', async () => {
            logger.info('🚀 Starting Nightly AI Analysis Job...');
            try {
                // Fetch all active clients across all agencies
                const result = await query(
                    `SELECT id, agency_id FROM clients WHERE status = 'active' AND is_archived = false`
                );
                
                const clients = result.rows;
                logger.info(`Found ${clients.length} active clients to process.`);

                let totalInsightsGenerated = 0;

                for (const client of clients) {
                    try {
                        const res = await InsightService.generateInsightsForClient(client.id, client.agency_id);
                        if (res && res.count) {
                            totalInsightsGenerated += res.count;
                        }
                    } catch (error) {
                        logger.error(`Error generating insights for client ${client.id}:`, error);
                    }
                }

                logger.info(`✅ Nightly AI Analysis Job completed. Total new insights: ${totalInsightsGenerated}`);
            } catch (error) {
                logger.error('❌ Failed to run nightly AI analysis job:', error);
            }
        });
        
        logger.info('⏰ Configured Nightly AI Analysis Cron Job (Runs at 02:00 AM)');
    }
}

module.exports = AIAnalysisJob;

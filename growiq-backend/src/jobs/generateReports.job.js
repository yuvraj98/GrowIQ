// src/jobs/generateReports.job.js
const cron = require('node-cron');
const { query } = require('../config/db');
const ReportService = require('../services/report.service');
const logger = require('../utils/logger');

class GenerateReportsJob {
    static init() {
        // Run every Monday at 3:00 AM
        cron.schedule('0 3 * * 1', async () => {
            logger.info('🚀 Starting Weekly Automated Reporting Job...');
            try {
                const result = await query(
                    `SELECT id, agency_id FROM clients WHERE status = 'active' AND is_archived = false`
                );
                
                const clients = result.rows;
                const end = new Date().toISOString().split('T')[0];
                const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                for (const client of clients) {
                    try {
                        await ReportService.generateReport(client.id, client.agency_id, start, end);
                    } catch (error) {
                        logger.error(`Error generating weekly report for client ${client.id}:`, error);
                    }
                }

                logger.info(`✅ Weekly Reporting Job completed. Processed ${clients.length} clients.`);
            } catch (error) {
                logger.error('❌ Failed to run weekly reporting job:', error);
            }
        });
        
        logger.info('⏰ Configured Weekly Automated Reporting Job (Runs Mondays at 03:00 AM)');
    }
}

module.exports = GenerateReportsJob;

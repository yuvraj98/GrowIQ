// src/server.js
// Server entry point
const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');

const PORT = env.PORT;
const initializeDatabase = require('./db/init');
const AIAnalysisJob = require('./jobs/runAIAnalysis.job');
const GenerateReportsJob = require('./jobs/generateReports.job');

// Start the server
const server = app.listen(PORT, async () => {
    await initializeDatabase();
    AIAnalysisJob.init();
    GenerateReportsJob.init();
    logger.info(`
  ╔═══════════════════════════════════════════════╗
  ║           🚀 GrowIQ API Server                ║
  ╠═══════════════════════════════════════════════╣
  ║  Status:      Running                         ║
  ║  Port:        ${PORT}                            ║
  ║  Environment: ${env.NODE_ENV.padEnd(28)}║
  ║  AI Mode:     ${env.AI_SERVICE_MODE.padEnd(28)}║
  ║  Mock APIs:   ${String(env.USE_MOCK_APIS).padEnd(28)}║
  ╠═══════════════════════════════════════════════╣
  ║  Health:      http://localhost:${PORT}/health     ║
  ║  API Base:    http://localhost:${PORT}/api/v1     ║
  ╚═══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });

    // Force shutdown after 10s
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason });
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

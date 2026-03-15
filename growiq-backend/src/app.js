// src/app.js
// Express application setup
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const clientRoutes = require('./routes/client.routes');
const campaignRoutes = require('./routes/campaign.routes');
const insightRoutes = require('./routes/insight.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const reportRoutes = require('./routes/report.routes');
const seoRoutes = require('./routes/seo.routes');
const socialRoutes = require('./routes/social.routes');
const webhookRoutes = require('./routes/webhook.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const integrationRoutes = require('./routes/integration.routes');
const notificationRoutes = require('./routes/notification.routes');
const teamRoutes = require('./routes/team.routes');
const portalRoutes = require('./routes/portal.routes');

const app = express();

// ─── Security Middleware ────────────────────────────────────
app.use(helmet());

// CORS — allow both localhost and 127.0.0.1 for Windows compatibility
const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
];
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // In dev, allow all origins
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Request Parsing ────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ────────────────────────────────────────────────
app.use(morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) },
}));

// ─── Rate Limiting (applied once) ───────────────────────────
app.use('/api/v1', apiLimiter);

// ─── Static Files (local dev — replaces S3) ─────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Root Route ─────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the DMTrack API. The server is running successfully.',
        documentation: '/api/v1',
        healthCheck: '/health'
    });
});

// ─── Health Check ───────────────────────────────────────────
app.get('/health', async (req, res) => {
    let dbStatus = 'disconnected';
    try {
        const { query } = require('./config/db');
        await query('SELECT 1');
        dbStatus = 'connected';
    } catch (err) {
        dbStatus = `error: ${err.message}`;
    }

    res.json({
        success: dbStatus === 'connected',
        data: {
            status: dbStatus === 'connected' ? 'healthy' : 'degraded',
            database: dbStatus,
            service: 'DMTrack API',
            version: '1.0.0',
            environment: env.NODE_ENV,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        },
    });
});

// ─── API Info ───────────────────────────────────────────────
app.get('/api/v1', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'DMTrack API',
            version: 'v1',
            description: 'All-in-One Digital Marketing Business Platform',
            documentation: '/api/v1/docs',
            endpoints: {
                auth: '/api/v1/auth',
                clients: '/api/v1/clients',
                campaigns: '/api/v1/campaigns',
                insights: '/api/v1/insights',
                invoices: '/api/v1/invoices',
                reports: '/api/v1/reports',
                seo: '/api/v1/seo',
                social: '/api/v1/social',
                analytics: '/api/v1/analytics',
            },
        },
    });
});

// ─── API Routes (v1) ────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', authenticate, clientRoutes);
app.use('/api/v1/campaigns', authenticate, campaignRoutes);
app.use('/api/v1/insights', authenticate, insightRoutes);
app.use('/api/v1/invoices', authenticate, invoiceRoutes);
app.use('/api/v1/reports', authenticate, reportRoutes);
app.use('/api/v1/seo', authenticate, seoRoutes);
app.use('/api/v1/social', authenticate, socialRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/analytics', authenticate, analyticsRoutes);
app.use('/api/v1/dashboard', authenticate, dashboardRoutes);
app.use('/api/v1/integrations', authenticate, integrationRoutes);
app.use('/api/v1/notifications', authenticate, notificationRoutes);
app.use('/api/v1/team', authenticate, teamRoutes);
app.use('/api/v1/portal', portalRoutes);

// ─── Dev-Only: Seed Data & Jobs ────────────────────────────────────
if (env.NODE_ENV === 'development') {
    const { seedClients, seedCampaigns, seedNotifications, seedInvoices, seedSEO, seedSocial } = require('./db/seed');
    app.post('/api/v1/dev/seed', authenticate, async (req, res) => {
        try {
            await seedClients(req.user.agencyId);
            await seedCampaigns(req.user.agencyId);
            await seedNotifications(req.user.agencyId, req.user.id);
            await seedInvoices(req.user.agencyId);
            await seedSEO(req.user.agencyId);
            await seedSocial(req.user.agencyId);
            res.json({ success: true, message: 'Seed data created (clients, campaigns, notifications, invoices, seo, social)' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    const AIAnalysisJob = require('./jobs/runAIAnalysis.job');
    app.post('/api/v1/dev/run-engine', authenticate, async (req, res) => {
        try {
            const { query } = require('./config/db');
            const InsightService = require('./services/insight.service');
            const result = await query(
                `SELECT id, agency_id FROM clients WHERE agency_id = $1 AND status = 'active' AND is_archived = false`,
                [req.user.agencyId]
            );
            
            let total = 0;
            for (const client of result.rows) {
                const res = await InsightService.generateInsightsForClient(client.id, client.agency_id);
                if (res && res.count) total += res.count;
            }
            res.json({ success: true, message: `Global AI engine triggered. ${total} insights generated.` });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });
}

// ─── Error Handling ─────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

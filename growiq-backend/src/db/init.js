// src/db/init.js
// Complete database schema — Sprint 3
const { pool } = require('../config/db');
const logger = require('../utils/logger');

const initializeDatabase = async () => {
    try {
        // ─── Core Tables ────────────────────────────────────────
        await pool.query(`
            CREATE TABLE IF NOT EXISTS agencies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                plan VARCHAR(50) DEFAULT 'free',
                logo_url TEXT,
                primary_color VARCHAR(7) DEFAULT '#6366f1',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'finance', 'viewer')),
                is_active BOOLEAN DEFAULT true,
                reset_password_token VARCHAR(255),
                reset_password_expires TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- ─── Clients ────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS clients (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
                business_name VARCHAR(255) NOT NULL,
                contact_name VARCHAR(255),
                contact_email VARCHAR(255),
                contact_phone VARCHAR(50),
                industry VARCHAR(100),
                website VARCHAR(255),
                gst_number VARCHAR(20),
                plan VARCHAR(50) DEFAULT 'starter',
                monthly_retainer NUMERIC(12, 2) DEFAULT 0,
                contract_start DATE,
                contract_end DATE,
                status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'churned')),
                health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
                notes TEXT,
                is_archived BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_clients_agency ON clients(agency_id);
            CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

            -- ─── Client Integrations ────────────────────────────────
            CREATE TABLE IF NOT EXISTS client_integrations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                platform VARCHAR(50) NOT NULL CHECK (platform IN ('meta', 'google_ads', 'ga4', 'search_console', 'instagram')),
                access_token_encrypted TEXT,
                refresh_token_encrypted TEXT,
                account_id VARCHAR(255),
                status VARCHAR(20) DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
                last_synced_at TIMESTAMP WITH TIME ZONE,
                token_expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_integrations_client ON client_integrations(client_id);
            CREATE UNIQUE INDEX IF NOT EXISTS uq_client_platform ON client_integrations(client_id, platform);

            -- ─── Campaigns ──────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS campaigns (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                platform VARCHAR(50) NOT NULL CHECK (platform IN ('meta', 'google_ads')),
                platform_campaign_id VARCHAR(255),
                name VARCHAR(255) NOT NULL,
                objective VARCHAR(100),
                status VARCHAR(50) DEFAULT 'active',
                budget_total NUMERIC(12, 2),
                budget_daily NUMERIC(12, 2),
                start_date DATE,
                end_date DATE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);

            -- ─── Campaign Metrics (daily) ───────────────────────────
            CREATE TABLE IF NOT EXISTS campaign_metrics (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
                date DATE NOT NULL,
                impressions INTEGER DEFAULT 0,
                clicks INTEGER DEFAULT 0,
                spend NUMERIC(12, 2) DEFAULT 0,
                conversions INTEGER DEFAULT 0,
                revenue NUMERIC(12, 2) DEFAULT 0,
                reach INTEGER DEFAULT 0,
                ctr NUMERIC(8, 4) DEFAULT 0,
                cpc NUMERIC(8, 2) DEFAULT 0,
                roas NUMERIC(8, 2) DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(campaign_id, date)
            );

            CREATE INDEX IF NOT EXISTS idx_metrics_campaign_date ON campaign_metrics(campaign_id, date);

            -- ─── AI Insights ────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS ai_insights (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL CHECK (type IN ('alert', 'opportunity', 'forecast', 'recommendation')),
                severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
                title VARCHAR(500) NOT NULL,
                description TEXT,
                data JSONB,
                is_actioned BOOLEAN DEFAULT false,
                is_dismissed BOOLEAN DEFAULT false,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_insights_client ON ai_insights(client_id);

            -- ─── Invoices ───────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS invoices (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
                invoice_number VARCHAR(50) UNIQUE NOT NULL,
                amount NUMERIC(12, 2) NOT NULL,
                tax_amount NUMERIC(12, 2) DEFAULT 0,
                total_amount NUMERIC(12, 2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
                due_date DATE NOT NULL,
                paid_at TIMESTAMP WITH TIME ZONE,
                pdf_url TEXT,
                razorpay_payment_id VARCHAR(255),
                razorpay_order_id VARCHAR(255),
                notes TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
            CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

            -- ─── Payments ───────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS payments (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
                amount NUMERIC(12, 2) NOT NULL,
                method VARCHAR(50),
                razorpay_payment_id VARCHAR(255),
                razorpay_signature VARCHAR(255),
                status VARCHAR(20) DEFAULT 'captured' CHECK (status IN ('captured', 'failed', 'refunded')),
                paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- ─── Reports ────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS reports (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                period_start DATE NOT NULL,
                period_end DATE NOT NULL,
                pdf_url TEXT,
                ai_summary TEXT,
                status VARCHAR(20) DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'sent', 'failed')),
                sent_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- ─── SEO ────────────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS seo_keywords (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                keyword VARCHAR(500) NOT NULL,
                current_position INTEGER,
                previous_position INTEGER,
                search_volume INTEGER,
                difficulty INTEGER,
                url VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS seo_rankings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                keyword_id UUID NOT NULL REFERENCES seo_keywords(id) ON DELETE CASCADE,
                position INTEGER NOT NULL,
                date DATE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(keyword_id, date)
            );

            -- ─── Social Posts ───────────────────────────────────────
            CREATE TABLE IF NOT EXISTS social_posts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                platform VARCHAR(50) NOT NULL,
                content TEXT,
                media_url TEXT,
                scheduled_at TIMESTAMP WITH TIME ZONE,
                published_at TIMESTAMP WITH TIME ZONE,
                status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
                reach INTEGER DEFAULT 0,
                engagement INTEGER DEFAULT 0,
                likes INTEGER DEFAULT 0,
                comments INTEGER DEFAULT 0,
                shares INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            -- ─── Notifications ──────────────────────────────────────
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                message TEXT,
                type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
                is_read BOOLEAN DEFAULT false,
                link VARCHAR(500),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

            -- ─── Audit Logs ─────────────────────────────────────────
            CREATE TABLE IF NOT EXISTS audit_logs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
                action VARCHAR(100) NOT NULL,
                entity_type VARCHAR(50),
                entity_id UUID,
                details JSONB,
                ip_address VARCHAR(50),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_audit_agency ON audit_logs(agency_id);
        `);

        logger.info('✅ Database initialized — all tables created successfully');
    } catch (error) {
        logger.error('❌ Database initialization failed:', error);
    }
};

module.exports = initializeDatabase;

// src/db/seed.js
// Seed database with mock clients for development
const { query } = require('../config/db');
const logger = require('../utils/logger');

const MOCK_CLIENTS = [
    {
        business_name: 'FreshBite Foods',
        contact_name: 'Priya Sharma',
        contact_email: 'priya@freshbite.in',
        contact_phone: '+91 98765 43210',
        industry: 'Food & Beverage',
        website: 'https://freshbite.in',
        gst_number: '27AAACF0123A1Z5',
        plan: 'growth',
        monthly_retainer: 35000,
        status: 'active',
        health_score: 82,
    },
    {
        business_name: 'UrbanStyle Fashion',
        contact_name: 'Rahul Mehta',
        contact_email: 'rahul@urbanstyle.com',
        contact_phone: '+91 87654 32109',
        industry: 'Fashion & Apparel',
        website: 'https://urbanstyle.com',
        gst_number: '29AABCU1234B1ZP',
        plan: 'premium',
        monthly_retainer: 75000,
        status: 'active',
        health_score: 91,
    },
    {
        business_name: 'TechNova Solutions',
        contact_name: 'Anil Kumar',
        contact_email: 'anil@technova.io',
        contact_phone: '+91 76543 21098',
        industry: 'Technology / SaaS',
        website: 'https://technova.io',
        gst_number: '06AABCT5678C1ZQ',
        plan: 'starter',
        monthly_retainer: 15000,
        status: 'paused',
        health_score: 45,
    },
];

async function seedClients(agencyId) {
    try {
        // Check if clients already exist for this agency
        const existing = await query('SELECT COUNT(*) FROM clients WHERE agency_id = $1', [agencyId]);
        if (parseInt(existing.rows[0].count, 10) > 0) {
            logger.info('Clients already seeded, skipping...');
            return;
        }

        for (const client of MOCK_CLIENTS) {
            await query(
                `INSERT INTO clients (
                    agency_id, business_name, contact_name, contact_email, contact_phone,
                    industry, website, gst_number, plan, monthly_retainer, status, health_score,
                    contract_start, contract_end
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                [
                    agencyId,
                    client.business_name, client.contact_name, client.contact_email, client.contact_phone,
                    client.industry, client.website, client.gst_number, client.plan,
                    client.monthly_retainer, client.status, client.health_score,
                    '2026-01-01', '2026-12-31'
                ]
            );
        }

        logger.info(`✅ Seeded ${MOCK_CLIENTS.length} mock clients for agency ${agencyId}`);
    } catch (error) {
        logger.error('Seeding error:', error);
    }
}

async function seedCampaigns(agencyId) {
    try {
        // Get clients for this agency
        const clientsResult = await query(
            'SELECT id, business_name FROM clients WHERE agency_id = $1 AND is_archived = false ORDER BY created_at',
            [agencyId]
        );
        const clients = clientsResult.rows;
        if (!clients.length) { logger.info('No clients to seed campaigns for.'); return; }

        // Check already seeded
        const existing = await query(
            'SELECT COUNT(*) FROM campaigns c JOIN clients cl ON c.client_id = cl.id WHERE cl.agency_id = $1',
            [agencyId]
        );
        if (parseInt(existing.rows[0].count) > 0) { logger.info('Campaigns already seeded.'); return; }

        const MOCK_CAMPAIGNS = [
            // FreshBite Foods
            { platform: 'meta',       name: 'FreshBite — Diwali Sale 2026',    objective: 'SALES',         status: 'active',    budget_daily: 2000 },
            { platform: 'google_ads', name: 'FreshBite — Brand Search',        objective: 'SEARCH',        status: 'active',    budget_daily: 1500 },
            // UrbanStyle Fashion
            { platform: 'meta',       name: 'UrbanStyle — Summer Collection',  objective: 'REACH',         status: 'active',    budget_daily: 3500 },
            { platform: 'meta',       name: 'UrbanStyle — Retargeting',        objective: 'CONVERSIONS',   status: 'paused',    budget_daily: 1000 },
            { platform: 'google_ads', name: 'UrbanStyle — Shopping Ads',       objective: 'SHOPPING',      status: 'active',    budget_daily: 2500 },
            // TechNova Solutions
            { platform: 'google_ads', name: 'TechNova — Lead Gen Search',      objective: 'LEAD_GEN',      status: 'paused',    budget_daily: 800 },
        ];

        const clientMap = {
            'FreshBite Foods': clients[0]?.id,
            'UrbanStyle Fashion': clients[1]?.id,
            'TechNova Solutions': clients[2]?.id,
        };

        const CampaignService = require('../services/campaign.service');

        for (const camp of MOCK_CAMPAIGNS) {
            const clientName = Object.keys(clientMap).find(k => camp.name.startsWith(k.split(' ')[0]));
            const clientId = clientMap[clientName];
            if (!clientId) continue;

            const result = await query(`
                INSERT INTO campaigns (client_id, platform, name, objective, status, budget_daily, start_date)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [clientId, camp.platform, camp.name, camp.objective, camp.status, camp.budget_daily, '2026-01-15']);

            const campaignId = result.rows[0].id;

            // Generate 14 days of mock metrics
            const today = new Date();
            for (let i = 13; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const base = camp.platform === 'meta' ? 1200 : 900;
                const impressions = Math.floor(base * (0.7 + Math.random() * 0.7));
                const clicks      = Math.floor(impressions * (0.02 + Math.random() * 0.035));
                const spend       = parseFloat((clicks * (7 + Math.random() * 6)).toFixed(2));
                const conversions = Math.floor(clicks * (0.035 + Math.random() * 0.07));
                const revenue     = parseFloat((conversions * (400 + Math.random() * 400)).toFixed(2));
                const roas        = spend > 0 ? parseFloat((revenue / spend).toFixed(2)) : 0;
                const ctr         = impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(4)) : 0;
                const cpc         = clicks > 0 ? parseFloat((spend / clicks).toFixed(2)) : 0;

                if (camp.status === 'active' || i < 7) {
                    await CampaignService.upsertMetrics(campaignId, dateStr, {
                        impressions, clicks, spend, conversions, revenue,
                        reach: Math.floor(impressions * 0.82), roas, ctr, cpc,
                    });
                }
            }
        }

        logger.info(`✅ Seeded ${MOCK_CAMPAIGNS.length} campaigns with metrics`);
    } catch (error) {
        logger.error('Campaign seeding error:', error);
    }
}

async function seedNotifications(agencyId, userId) {
    try {
        const existing = await query('SELECT COUNT(*) FROM notifications WHERE user_id = $1', [userId]);
        if (parseInt(existing.rows[0].count) > 0) return;

        const notifs = [
            {
                title: 'Campaign ROAS Alert',
                message: 'TechNova Lead Gen Search ROAS has dropped below 1.5x threshold over the last 3 days.',
                type: 'error',
                link: '/dashboard/campaigns'
            },
            {
                title: 'Client Health Warning',
                message: 'TechNova Solutions health score dropped below 50. Review their recent performance metrics.',
                type: 'warning',
                link: '/dashboard/clients'
            },
            {
                title: 'Invoice Paid',
                message: 'UrbanStyle Fashion paid Invoice #INV-2026-002 (₹75,000).',
                type: 'success',
                link: '/dashboard/invoices'
            },
            {
                title: 'Meta Ads Synced',
                message: 'Successfully pulled the latest data for FreshBite Foods from Meta Ads API.',
                type: 'info',
                link: null
            }
        ];

        const NotificationService = require('../services/notification.service');
        for (const n of notifs) {
            await NotificationService.create(userId, agencyId, n.title, n.message, n.type, n.link);
        }
        logger.info(`✅ Seeded ${notifs.length} mock notifications for user ${userId}`);
    } catch (error) {
        logger.error('Notification seeding error:', error);
    }
}

async function seedInvoices(agencyId) {
    try {
        const clientRes = await query('SELECT id, business_name, monthly_retainer FROM clients WHERE agency_id = $1', [agencyId]);
        if (clientRes.rows.length === 0) return;

        for (const client of clientRes.rows) {
            // Check if invoices already exist for this client
            const existing = await query('SELECT id FROM invoices WHERE client_id = $1 LIMIT 1', [client.id]);
            if (existing.rows.length > 0) continue;

            const baseAmount = parseFloat(client.monthly_retainer) || 50000;
            const tax = baseAmount * 0.18;
            const total = baseAmount + tax;

            // Seed a PAID invoice from last month
            await query(`
                INSERT INTO invoices (client_id, agency_id, invoice_number, amount, tax_amount, total_amount, status, due_date, paid_at, notes)
                VALUES ($1, $2, $3, $4, $5, $6, 'paid', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '25 days', 'Monthly retainer for last month')
            `, [client.id, agencyId, `INV-${client.business_name.substring(0,3).toUpperCase()}-001`, baseAmount, tax, total]);

            // Seed a PENDING invoice for this month
            await query(`
                INSERT INTO invoices (client_id, agency_id, invoice_number, amount, tax_amount, total_amount, status, due_date, notes)
                VALUES ($1, $2, $3, $4, $5, $6, 'pending', CURRENT_DATE + INTERVAL '5 days', 'Monthly retainer for current month')
            `, [client.id, agencyId, `INV-${client.business_name.substring(0,3).toUpperCase()}-002`, baseAmount, tax, total]);
        }
        logger.info(`✅ Seeded mock invoices for agency ${agencyId}`);
    } catch (error) {
        logger.error('Invoice seeding error:', error);
    }
}

async function seedSEO(agencyId) {
    try {
        const clientRes = await query('SELECT id FROM clients WHERE agency_id = $1', [agencyId]);
        if (clientRes.rows.length === 0) return;

        const mockKeywords = ['best digital agency', 'marketing automation', 'seo services india', 'ppc management', 'social media strategy'];

        for (const client of clientRes.rows) {
            const existing = await query('SELECT id FROM seo_keywords WHERE client_id = $1 LIMIT 1', [client.id]);
            if (existing.rows.length > 0) continue;

            for (const kw of mockKeywords) {
                const curPos = Math.floor(Math.random() * 20) + 1;
                const prevPos = Math.floor(Math.random() * 20) + 5;
                
                const kwResult = await query(`
                    INSERT INTO seo_keywords (client_id, keyword, current_position, previous_position, search_volume, difficulty, url)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING id
                `, [client.id, kw, curPos, prevPos, Math.floor(Math.random() * 2000) + 500, Math.floor(Math.random() * 50) + 20, 'https://clientwebsite.com']);

                const kwId = kwResult.rows[0].id;

                // Seed 7 days of rankings
                for (let i = 0; i < 7; i++) {
                    await query(`
                        INSERT INTO seo_rankings (keyword_id, position, date)
                        VALUES ($1, $2, CURRENT_DATE - INTERVAL '${i} days')
                    `, [kwId, Math.floor(Math.random() * 20) + 1]);
                }
            }
        }
        logger.info(`✅ Seeded SEO keywords for agency ${agencyId}`);
    } catch (error) {
        logger.error('SEO seeding error:', error);
    }
}

module.exports = { seedClients, seedCampaigns, seedNotifications, seedInvoices, seedSEO };

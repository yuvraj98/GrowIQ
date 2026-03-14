// src/services/integration.service.js
// Manages client platform integrations (Meta, Google Ads, GA4, etc.)
const { query } = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');
const logger = require('../utils/logger');

const SUPPORTED_PLATFORMS = ['meta', 'google_ads', 'ga4', 'search_console', 'instagram'];

class IntegrationService {
    /**
     * List all integrations for a client
     */
    static async listForClient(clientId, agencyId) {
        // Verify client belongs to agency
        const clientCheck = await query(
            'SELECT id FROM clients WHERE id = $1 AND agency_id = $2 AND is_archived = false',
            [clientId, agencyId]
        );
        if (!clientCheck.rows.length) throw new Error('Client not found');

        const result = await query(`
            SELECT id, client_id, platform, account_id, status,
                   last_synced_at, token_expires_at, created_at,
                   CASE WHEN access_token_encrypted IS NOT NULL THEN true ELSE false END AS has_token
            FROM client_integrations
            WHERE client_id = $1
            ORDER BY platform
        `, [clientId]);

        return result.rows;
    }

    /**
     * Get integration status summary for all platforms for a client
     */
    static async getStatusSummary(clientId, agencyId) {
        const existing = await IntegrationService.listForClient(clientId, agencyId);
        const connected = {};
        for (const i of existing) {
            connected[i.platform] = i;
        }

        return SUPPORTED_PLATFORMS.map(platform => ({
            platform,
            ...( connected[platform] || {
                status: 'disconnected',
                account_id: null,
                last_synced_at: null,
                has_token: false,
            }),
        }));
    }

    /**
     * Connect a platform — stores encrypted token
     * In dev mode (USE_MOCK_APIS=true), accepts any token string
     * In prod, this would be called after OAuth callback
     */
    static async connect(clientId, agencyId, data) {
        const { platform, access_token, refresh_token, account_id, token_expires_at } = data;

        if (!SUPPORTED_PLATFORMS.includes(platform)) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        // Verify client belongs to agency
        const clientCheck = await query(
            'SELECT id FROM clients WHERE id = $1 AND agency_id = $2 AND is_archived = false',
            [clientId, agencyId]
        );
        if (!clientCheck.rows.length) throw new Error('Client not found');

        const accessEnc  = encrypt(access_token || 'mock_access_token');
        const refreshEnc = encrypt(refresh_token || null);

        // Upsert
        const result = await query(`
            INSERT INTO client_integrations (
                client_id, platform, access_token_encrypted, refresh_token_encrypted,
                account_id, status, last_synced_at, token_expires_at
            ) VALUES ($1, $2, $3, $4, $5, 'connected', NOW(), $6)
            ON CONFLICT (client_id, platform)
            DO UPDATE SET
                access_token_encrypted = EXCLUDED.access_token_encrypted,
                refresh_token_encrypted = EXCLUDED.refresh_token_encrypted,
                account_id = COALESCE(EXCLUDED.account_id, client_integrations.account_id),
                status = 'connected',
                last_synced_at = NOW(),
                token_expires_at = EXCLUDED.token_expires_at,
                updated_at = NOW()
            RETURNING id, client_id, platform, account_id, status, last_synced_at
        `, [clientId, platform, accessEnc, refreshEnc, account_id || null, token_expires_at || null]);

        logger.info(`✅ Platform connected: ${platform} for client ${clientId}`);
        // Return without encrypted fields
        const row = await query(`
            SELECT id, client_id, platform, account_id, status, last_synced_at,
                   CASE WHEN access_token_encrypted IS NOT NULL THEN true ELSE false END AS has_token
            FROM client_integrations WHERE id = $1
        `, [result.rows[0].id]);
        return row.rows[0];
    }

    /**
     * Disconnect a platform — wipes tokens but keeps record
     */
    static async disconnect(clientId, agencyId, platform) {
        const clientCheck = await query(
            'SELECT id FROM clients WHERE id = $1 AND agency_id = $2',
            [clientId, agencyId]
        );
        if (!clientCheck.rows.length) throw new Error('Client not found');

        const result = await query(`
            UPDATE client_integrations
            SET access_token_encrypted = NULL, refresh_token_encrypted = NULL,
                status = 'disconnected', updated_at = NOW()
            WHERE client_id = $1 AND platform = $2
            RETURNING id, platform, status
        `, [clientId, platform]);

        if (!result.rows.length) throw new Error('Integration not found');
        logger.info(`🔌 Platform disconnected: ${platform} for client ${clientId}`);
        return result.rows[0];
    }

    /**
     * Get decrypted token for internal use by sync services
     */
    static async getToken(clientId, platform) {
        const result = await query(`
            SELECT access_token_encrypted, refresh_token_encrypted, token_expires_at, status
            FROM client_integrations
            WHERE client_id = $1 AND platform = $2
        `, [clientId, platform]);

        if (!result.rows.length || result.rows[0].status !== 'connected') return null;
        const row = result.rows[0];
        return {
            access_token: decrypt(row.access_token_encrypted),
            refresh_token: decrypt(row.refresh_token_encrypted),
            expires_at: row.token_expires_at,
        };
    }

    /**
     * Mark integration as errored (called by sync service on failure)
     */
    static async markError(clientId, platform) {
        await query(`
            UPDATE client_integrations
            SET status = 'error', updated_at = NOW()
            WHERE client_id = $1 AND platform = $2
        `, [clientId, platform]);
    }
}

module.exports = { IntegrationService, SUPPORTED_PLATFORMS };

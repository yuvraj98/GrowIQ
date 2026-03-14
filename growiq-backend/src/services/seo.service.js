// src/services/seo.service.js
const { query } = require('../config/db');
const logger = require('../utils/logger');

class SEOService {
    /**
     * Get all keywords for a client with their latest rankings
     */
    static async getClientKeywords(agencyId, clientId) {
        // Verify client belongs to agency
        const clientCheck = await query('SELECT id FROM clients WHERE id = $1 AND agency_id = $2', [clientId, agencyId]);
        if (!clientCheck.rows.length) throw new Error('Client not found');

        const result = await query(`
            SELECT k.*, 
                   (SELECT position FROM seo_rankings WHERE keyword_id = k.id ORDER BY date DESC LIMIT 1) as live_position,
                   (SELECT position FROM seo_rankings WHERE keyword_id = k.id AND date < (SELECT MAX(date) FROM seo_rankings WHERE keyword_id = k.id) ORDER BY date DESC LIMIT 1) as prev_pos
            FROM seo_keywords k
            WHERE k.client_id = $1
            ORDER BY k.keyword ASC
        `, [clientId]);
        
        return result.rows;
    }

    /**
     * Add a new keyword to track
     */
    static async addKeyword(agencyId, clientId, keyword, url) {
        const clientCheck = await query('SELECT id FROM clients WHERE id = $1 AND agency_id = $2', [clientId, agencyId]);
        if (!clientCheck.rows.length) throw new Error('Client not found');

        const result = await query(`
            INSERT INTO seo_keywords (client_id, keyword, url, search_volume, difficulty)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [clientId, keyword, url || '', Math.floor(Math.random() * 5000) + 100, Math.floor(Math.random() * 60) + 10]);

        return result.rows[0];
    }

    /**
     * Update keyword ranking (Auto/Manual)
     */
    static async updateRanking(keywordId, position, date = new Date()) {
        const result = await query(`
            INSERT INTO seo_rankings (keyword_id, position, date)
            VALUES ($1, $2, $3)
            ON CONFLICT (keyword_id, date) DO UPDATE 
            SET position = EXCLUDED.position
            RETURNING *
        `, [keywordId, position, date]);

        // Also update the main keyword table for denormalized quick-access
        await query('UPDATE seo_keywords SET previous_position = current_position, current_position = $1, updated_at = NOW() WHERE id = $2', [position, keywordId]);

        return result.rows[0];
    }

    /**
     * Get ranking history for a keyword (Chart data)
     */
    static async getRankingHistory(keywordId, days = 30) {
        const result = await query(`
            SELECT position, date 
            FROM seo_rankings 
            WHERE keyword_id = $1 
            AND date >= CURRENT_DATE - INTERVAL '$2 days'
            ORDER BY date ASC
        `, [keywordId, days]);
        return result.rows;
    }

    /**
     * Delete keyword
     */
    static async deleteKeyword(agencyId, keywordId) {
        const verify = await query(`
            SELECT k.id FROM seo_keywords k
            JOIN clients c ON k.client_id = c.id
            WHERE k.id = $1 AND c.agency_id = $2
        `, [keywordId, agencyId]);

        if (!verify.rows.length) throw new Error('Keyword not found');

        await query('DELETE FROM seo_keywords WHERE id = $1', [keywordId]);
    }
}

module.exports = SEOService;

// src/services/social.service.js
const { query } = require('../config/db');
const logger = require('../utils/logger');

class SocialService {
    /**
     * Get posts for a client
     */
    static async getClientPosts(agencyId, clientId = null) {
        let sql = `
            SELECT p.*, c.business_name as client_name
            FROM social_posts p
            JOIN clients c ON p.client_id = c.id
            WHERE c.agency_id = $1
        `;
        const params = [agencyId];

        if (clientId) {
            params.push(clientId);
            sql += ` AND p.client_id = $2`;
        }

        sql += ` ORDER BY p.scheduled_at DESC, p.created_at DESC`;
        
        const result = await query(sql, params);
        return result.rows;
    }

    /**
     * Create/Schedule a new post
     */
    static async createPost(agencyId, clientId, postData) {
        // Verify client belongs to agency
        const clientCheck = await query('SELECT id FROM clients WHERE id = $1 AND agency_id = $2', [clientId, agencyId]);
        if (!clientCheck.rows.length) throw new Error('Client not found');

        const { platform, content, mediaUrl, scheduledAt } = postData;
        
        const status = scheduledAt ? 'scheduled' : 'draft';

        const result = await query(`
            INSERT INTO social_posts (client_id, platform, content, media_url, scheduled_at, status)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [clientId, platform, content, mediaUrl || null, scheduledAt || null, status]);

        return result.rows[0];
    }

    /**
     * Update post status (Mocking publishing)
     */
    static async updateStatus(postId, agencyId, status) {
        // Verify post belongs to agency
        const verifyResult = await query(`
            SELECT p.id FROM social_posts p
            JOIN clients c ON p.client_id = c.id
            WHERE p.id = $1 AND c.agency_id = $2
        `, [postId, agencyId]);

        if (!verifyResult.rows.length) throw new Error('Post not found');

        const result = await query(`
            UPDATE social_posts 
            SET status = $1, published_at = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
        `, [status, status === 'published' ? new Date() : null, postId]);

        return result.rows[0];
    }

    /**
     * Delete a post
     */
    static async deletePost(postId, agencyId) {
        const verifyResult = await query(`
            SELECT p.id FROM social_posts p
            JOIN clients c ON p.client_id = c.id
            WHERE p.id = $1 AND c.agency_id = $2
        `, [postId, agencyId]);

        if (!verifyResult.rows.length) throw new Error('Post not found');

        await query('DELETE FROM social_posts WHERE id = $1', [postId]);
    }

    /**
     * Mock Analytics (Generating fake engagement for published posts)
     */
    static async syncAnalytic(postId, agencyId) {
        // In a real app, this would call Instagram/LinkedIn/FB Graph API
        const reach = Math.floor(Math.random() * 5000) + 100;
        const engagement = Math.floor(reach * (Math.random() * 0.1));
        const likes = Math.floor(engagement * 0.7);
        const comments = Math.floor(engagement * 0.2);
        const shares = Math.floor(engagement * 0.1);

        const result = await query(`
            UPDATE social_posts
            SET reach = $1, engagement = $2, likes = $3, comments = $4, shares = $5, updated_at = NOW()
            WHERE id = $6
            RETURNING *
        `, [reach, engagement, likes, comments, shares, postId]);

        return result.rows[0];
    }
}

module.exports = SocialService;

// src/controllers/social.controller.js
const SocialService = require('../services/social.service');

class SocialController {
    /**
     * GET /api/v1/social
     */
    static async getPosts(req, res, next) {
        try {
            const { clientId } = req.query;
            const posts = await SocialService.getClientPosts(req.user.agencyId, clientId);
            res.json({ success: true, data: posts });
        } catch (err) { next(err); }
    }

    /**
     * POST /api/v1/social
     */
    static async createPost(req, res, next) {
        try {
            const { clientId, platform, content, mediaUrl, scheduledAt } = req.body;
            if (!clientId || !platform || !content) {
                return res.status(400).json({ success: false, error: { message: 'Client, platform, and content are required' }});
            }

            const post = await SocialService.createPost(req.user.agencyId, clientId, {
                platform, content, mediaUrl, scheduledAt
            });
            
            res.status(201).json({ success: true, data: post });
        } catch (err) { next(err); }
    }

    /**
     * PATCH /api/v1/social/:id/publish
     * Manually trigger publish (Mock)
     */
    static async publishPost(req, res, next) {
        try {
            const post = await SocialService.updateStatus(req.params.id, req.user.agencyId, 'published');
            // Sync initial analytics
            await SocialService.syncAnalytic(req.params.id, req.user.agencyId);
            res.json({ success: true, data: post, message: 'Post published successfully' });
        } catch (err) { next(err); }
    }

    /**
     * POST /api/v1/social/:id/sync
     */
    static async syncStats(req, res, next) {
        try {
            const post = await SocialService.syncAnalytic(req.params.id, req.user.agencyId);
            res.json({ success: true, data: post });
        } catch (err) { next(err); }
    }

    /**
     * DELETE /api/v1/social/:id
     */
    static async deletePost(req, res, next) {
        try {
            await SocialService.deletePost(req.params.id, req.user.agencyId);
            res.json({ success: true, message: 'Post removed' });
        } catch (err) { next(err); }
    }
}

module.exports = SocialController;

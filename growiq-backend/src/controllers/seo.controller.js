// src/controllers/seo.controller.js
const SEOService = require('../services/seo.service');

class SEOController {
    /**
     * GET /api/v1/seo/:clientId
     */
    static async getKeywords(req, res, next) {
        try {
            const keywords = await SEOService.getClientKeywords(req.user.agencyId, req.params.clientId);
            res.json({ success: true, data: keywords });
        } catch (err) { next(err); }
    }

    /**
     * POST /api/v1/seo/:clientId
     */
    static async addKeyword(req, res, next) {
        try {
            const { keyword, url } = req.body;
            if (!keyword) return res.status(400).json({ success: false, error: { message: 'Keyword is required' }});
            
            const kw = await SEOService.addKeyword(req.user.agencyId, req.params.clientId, keyword, url);
            res.status(201).json({ success: true, data: kw });
        } catch (err) { next(err); }
    }

    /**
     * GET /api/v1/seo/keyword/:keywordId/history
     */
    static async getHistory(req, res, next) {
        try {
            const history = await SEOService.getRankingHistory(req.params.keywordId, req.query.days || 30);
            res.json({ success: true, data: history });
        } catch (err) { next(err); }
    }

    /**
     * DELETE /api/v1/seo/keyword/:keywordId
     */
    static async deleteKeyword(req, res, next) {
        try {
            await SEOService.deleteKeyword(req.user.agencyId, req.params.keywordId);
            res.json({ success: true, message: 'Keyword tracking stopped' });
        } catch (err) { next(err); }
    }
}

module.exports = SEOController;

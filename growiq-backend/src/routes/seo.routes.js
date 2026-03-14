// src/routes/seo.routes.js
const express = require('express');
const router = express.Router();
const SEOController = require('../controllers/seo.controller');
const { authorize } = require('../middleware/auth');

router.get('/:clientId', authorize('owner', 'manager', 'viewer'), SEOController.getKeywords);
router.post('/:clientId', authorize('owner', 'manager'), SEOController.addKeyword);
router.get('/keyword/:keywordId/history', authorize('owner', 'manager', 'viewer'), SEOController.getHistory);
router.delete('/keyword/:keywordId', authorize('owner', 'manager'), SEOController.deleteKeyword);

module.exports = router;

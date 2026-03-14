// src/routes/social.routes.js
const express = require('express');
const router = express.Router();
const SocialController = require('../controllers/social.controller');
const { authorize } = require('../middleware/auth');

router.get('/', authorize('owner', 'manager', 'viewer'), SocialController.getPosts);
router.post('/', authorize('owner', 'manager'), SocialController.createPost);
router.patch('/:id/publish', authorize('owner', 'manager'), SocialController.publishPost);
router.post('/:id/sync', authorize('owner', 'manager'), SocialController.syncStats);
router.delete('/:id', authorize('owner', 'manager'), SocialController.deletePost);

module.exports = router;

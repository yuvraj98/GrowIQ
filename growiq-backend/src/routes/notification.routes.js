// src/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authorize, authenticate } = require('../middleware/auth');

// Note: Ensure `app.use('/api/v1/notifications', authenticate, notificationRoutes);`

router.get('/', NotificationController.getNotifications);
router.put('/read-all', NotificationController.markAllRead);
router.put('/:id/read', NotificationController.markRead);
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;

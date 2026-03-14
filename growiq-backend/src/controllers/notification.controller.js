// src/controllers/notification.controller.js
const NotificationService = require('../services/notification.service');

class NotificationController {
    /**
     * GET /api/v1/notifications
     * Retrieve notifications for the current user
     */
    static async getNotifications(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;

            const data = await NotificationService.getUserNotifications(req.user.id, limit, offset);
            res.json({ success: true, data });
        } catch (err) {
            next(err);
        }
    }

    /**
     * PUT /api/v1/notifications/:id/read
     * Mark a single notification as read
     */
    static async markRead(req, res, next) {
        try {
            const notification = await NotificationService.markAsRead(req.params.id, req.user.id);
            res.json({ success: true, data: notification });
        } catch (err) {
            if (err.message.includes('not found')) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
            }
            next(err);
        }
    }

    /**
     * PUT /api/v1/notifications/read-all
     * Mark all unread notifications as read
     */
    static async markAllRead(req, res, next) {
        try {
            await NotificationService.markAllAsRead(req.user.id);
            res.json({ success: true, message: 'All notifications marked as read' });
        } catch (err) {
            next(err);
        }
    }

    /**
     * DELETE /api/v1/notifications/:id
     * Delete a single notification
     */
    static async deleteNotification(req, res, next) {
        try {
            await NotificationService.delete(req.params.id, req.user.id);
            res.json({ success: true, message: 'Notification deleted' });
        } catch (err) {
            if (err.message.includes('not found')) {
                return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: err.message } });
            }
            next(err);
        }
    }
}

module.exports = NotificationController;

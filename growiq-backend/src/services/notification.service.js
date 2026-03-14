// src/services/notification.service.js
const { query } = require('../config/db');
const logger = require('../utils/logger');

class NotificationService {
    /**
     * Get all notifications for a user
     */
    static async getUserNotifications(userId, limit = 50, offset = 0) {
        // Get the notifications
        const result = await query(`
            SELECT id, title, message, type, is_read, link, created_at
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2 OFFSET $3
        `, [userId, limit, offset]);

        // Get unread count
        const unreadCount = await query(`
            SELECT COUNT(*) FROM notifications
            WHERE user_id = $1 AND is_read = false
        `, [userId]);

        return {
            notifications: result.rows,
            unreadCount: parseInt(unreadCount.rows[0].count) || 0
        };
    }

    /**
     * Mark a specific notification as read
     */
    static async markAsRead(notificationId, userId) {
        const result = await query(`
            UPDATE notifications
            SET is_read = true
            WHERE id = $1 AND user_id = $2
            RETURNING id, is_read
        `, [notificationId, userId]);

        if (!result.rows.length) {
            throw new Error('Notification not found or unauthorized');
        }

        return result.rows[0];
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId) {
        await query(`
            UPDATE notifications
            SET is_read = true
            WHERE user_id = $1 AND is_read = false
        `, [userId]);
    }

    /**
     * Delete a notification
     */
    static async delete(notificationId, userId) {
        const result = await query(`
            DELETE FROM notifications
            WHERE id = $1 AND user_id = $2
            RETURNING id
        `, [notificationId, userId]);

        if (!result.rows.length) {
            throw new Error('Notification not found or unauthorized');
        }
    }

    /**
     * Internal: create a notification (e.g., used by workers/other services)
     */
    static async create(userId, agencyId, title, message, type = 'info', link = null) {
        const result = await query(`
            INSERT INTO notifications (user_id, agency_id, title, message, type, link)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, title, message, type, link, created_at
        `, [userId, agencyId, title, message, type, link]);

        // Here we could emit a WebSocket event if we had real-time socket.io implemented
        return result.rows[0];
    }
}

module.exports = NotificationService;

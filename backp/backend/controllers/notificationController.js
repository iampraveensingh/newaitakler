import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { broadcastToUser } from '../utils/wsManager.js';

// ─── Internal helper ──────────────────────────────────────────────────────────
/**
 * Fire-and-forget helper. Call this from entityController after a successful INSERT.
 * @param {number} userId
 * @param {object} opts - { type, title, message, icon, entityId, entityType }
 */
export async function pushNotification(userId, { type, title, message, icon, entityId, entityType }) {
  try {
    const [result] = await db.query(
      `INSERT INTO notifications (user_id, type, title, message, icon, entity_id, entity_type, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, type, title, message || null, icon || null, entityId || null, entityType || null]
    );
    // Push real-time event to all open WS connections for this user
    broadcastToUser(userId, {
      event: 'notification',
      data: {
        id: result.insertId,
        user_id: userId,
        type,
        title,
        message: message || null,
        icon: icon || null,
        entity_id: entityId || null,
        entity_type: entityType || null,
        is_read: 0,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.warn('pushNotification failed:', err.message);
  }
}

// ─── Route handlers ───────────────────────────────────────────────────────────

/** GET /api/notifications */
export const getNotifications = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    );
    const unreadCount = rows.filter(r => !r.is_read).length;
    return successResponse(res, { notifications: rows, unreadCount });
  } catch (err) {
    console.error('getNotifications error:', err);
    return errorResponse(res, 'Failed to fetch notifications', 500);
  }
};

/** PUT /api/notifications/read-all */
export const markAllRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0 AND is_deleted = 0`,
      [req.user.id]
    );
    return successResponse(res, null, 'All notifications marked as read');
  } catch (err) {
    return errorResponse(res, 'Failed to mark notifications as read', 500);
  }
};

/** PUT /api/notifications/:id/read */
export const markRead = async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    return successResponse(res, null, 'Marked as read');
  } catch (err) {
    return errorResponse(res, 'Failed to mark notification as read', 500);
  }
};

/** DELETE /api/notifications/:id — soft-delete only */
export const deleteNotification = async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_deleted = 1 WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    return successResponse(res, null, 'Notification deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete notification', 500);
  }
};

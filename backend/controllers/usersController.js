import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    let addons = user.addons;
    if (typeof addons === 'string') { try { addons = JSON.parse(addons); } catch { addons = {}; } }
    let billing_product_ids = user.billing_product_ids;
    if (typeof billing_product_ids === 'string') { try { billing_product_ids = JSON.parse(billing_product_ids); } catch { billing_product_ids = []; } }
    if (!Array.isArray(billing_product_ids)) billing_product_ids = [];
    return successResponse(res, { ...user, addons, billing_product_ids });
  } catch (error) {
    return errorResponse(res, 'Failed to get user profile', 500);
  }
};

export const updateMe = async (req, res) => {
  const { full_name, email } = req.body;
  try {
    await db.query(
      'UPDATE users SET full_name = ?, email = ?, updated_at = NOW() WHERE id = ?',
      [full_name, email, req.user.id]
    );
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    return successResponse(res, rows[0], 'Profile updated');
  } catch (error) {
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

// Admin: list all users
export const listUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, full_name, username, role, base_plan, addons, created_at FROM users WHERE is_active = 1 ORDER BY created_at DESC'
    );
    return successResponse(res, rows);
  } catch (error) {
    return errorResponse(res, 'Failed to list users', 500);
  }
};

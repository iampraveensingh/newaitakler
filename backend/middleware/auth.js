import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';
import { db } from '../config/database.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'No token provided', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to request
    const [rows] = await db.query(
      'SELECT id, username, email, full_name, role, base_plan, addons, billing_product_ids, plan_updated_at, last_login_at, agency_owner_id, credits_balance FROM users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );
    if (!rows.length) {
      return errorResponse(res, 'User not found', 401);
    }
    req.user = rows[0];
    // Parse JSON fields if stored as strings
    if (typeof req.user.addons === 'string') {
      try { req.user.addons = JSON.parse(req.user.addons); } catch { req.user.addons = {}; }
    }
    if (typeof req.user.billing_product_ids === 'string') {
      try { req.user.billing_product_ids = JSON.parse(req.user.billing_product_ids); } catch { req.user.billing_product_ids = []; }
    }
    if (!Array.isArray(req.user.billing_product_ids)) req.user.billing_product_ids = [];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired', 401);
    }
    return errorResponse(res, 'Invalid token', 401);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return errorResponse(res, 'Admin access required', 403);
  }
  next();
};

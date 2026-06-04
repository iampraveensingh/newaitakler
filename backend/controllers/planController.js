import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getPlanLimits = async (req, res) => {
  try {
    const { plan_id } = req.query;
    let query = 'SELECT * FROM plan_limits';
    const values = [];
    if (plan_id) {
      query += ' WHERE plan_id = ?';
      values.push(plan_id);
    }
    const [rows] = await db.query(query, values);
    return successResponse(res, rows);
  } catch (error) {
    return errorResponse(res, 'Failed to get plan limits', 500);
  }
};

export const getUsageMonthly = async (req, res) => {
  try {
    const { user_id, month_year } = req.query;
    const uid = user_id || req.user.id;
    const my = month_year || new Date().toISOString().slice(0, 7);

    const [rows] = await db.query(
      'SELECT * FROM user_usage_monthly WHERE user_id = ? AND month_year = ?',
      [uid, my]
    );
    return successResponse(res, rows);
  } catch (error) {
    return errorResponse(res, 'Failed to get usage', 500);
  }
};

// Whitelist of valid feature columns to prevent SQL injection
const FEATURE_COLUMNS = {
  credits:        'credits_used',
  clones:         'clones_used',
  vsl:            'vsl_used',
  ad:             'ad_used',
  custom:         'custom_used',
  transcriptions: 'transcriptions_used',
  brand_studio:   'brand_studio_used',
  conversational: 'conversational_used',
  audio_mix:      'audio_mix_used',
  audiobook:      'audiobook_used',
};

export const trackUsage = async (req, res) => {
  try {
    const { feature, amount = 1 } = req.body;

    const column = FEATURE_COLUMNS[feature];
    if (!column) {
      return errorResponse(res, `Invalid feature type. Valid types: ${Object.keys(FEATURE_COLUMNS).join(', ')}`, 400);
    }

    const increment = Math.max(1, parseInt(amount) || 1);
    const userId = req.user.id;
    const monthYear = new Date().toISOString().slice(0, 7);
    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Upsert: create row if not exists, then increment the column
    await db.query(
      `INSERT INTO user_usage_monthly (user_id, month_year, ${column}, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE ${column} = ${column} + ?, updated_at = NOW()`,
      [userId, monthYear, increment, nowIso, nowIso, increment]
    );

    // For agency sub-users tracking credits: validate balance then decrement
    if (feature === 'credits' && req.user.agency_owner_id) {
      const [[userRow]] = await db.query('SELECT credits_balance FROM users WHERE id = ?', [userId]);
      const remaining = parseInt(userRow?.credits_balance) || 0;
      if (remaining < increment) {
        return errorResponse(
          res,
          `Insufficient credits. You need ${increment} credits but only have ${remaining} remaining.`,
          400
        );
      }
      await db.query(
        'UPDATE users SET credits_balance = credits_balance - ?, updated_at = NOW() WHERE id = ?',
        [increment, userId]
      );
    }

    // Return updated usage row
    const [rows] = await db.query(
      'SELECT * FROM user_usage_monthly WHERE user_id = ? AND month_year = ?',
      [userId, monthYear]
    );
    return successResponse(res, rows[0] || {}, 'Usage tracked');
  } catch (error) {
    console.error('trackUsage error:', error);
    return errorResponse(res, 'Failed to track usage', 500);
  }
};

export const getDfyOffers = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM dfy_offers WHERE is_active = 1 ORDER BY is_featured DESC, created_at DESC');
    return successResponse(res, rows);
  } catch (error) {
    return errorResponse(res, 'Failed to get DFY offers', 500);
  }
};

import crypto from 'crypto';
import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ─── Generate or regenerate the user's API key ───────────────────────────────
export const generateApiKey = async (req, res) => {
  try {
    // 'atk_' prefix makes it easy to identify; 56 random hex chars → 60 chars total
    const apiKey = `atk_${crypto.randomBytes(28).toString('hex')}`;

    // One key per user — upsert replaces on duplicate user_id
    await db.query(
      `INSERT INTO user_api_keys (user_id, api_key, created_at, updated_at)
       VALUES (?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE api_key = ?, updated_at = NOW()`,
      [req.user.id, apiKey, apiKey]
    );

    return successResponse(res, { api_key: apiKey }, 'API key generated successfully');
  } catch (error) {
    console.error('generateApiKey error:', error);
    return errorResponse(res, 'Failed to generate API key', 500);
  }
};

// ─── Get the user's current API key ─────────────────────────────────────────
export const getApiKey = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT api_key, created_at, updated_at, last_used_at FROM user_api_keys WHERE user_id = ?',
      [req.user.id]
    );
    if (!rows.length) return successResponse(res, null);
    return successResponse(res, rows[0]);
  } catch (error) {
    console.error('getApiKey error:', error);
    return errorResponse(res, 'Failed to fetch API key', 500);
  }
};

// ─── Revoke (delete) the user's API key ─────────────────────────────────────
export const revokeApiKey = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM user_api_keys WHERE user_id = ?',
      [req.user.id]
    );
    return successResponse(res, null, 'API key revoked successfully');
  } catch (error) {
    console.error('revokeApiKey error:', error);
    return errorResponse(res, 'Failed to revoke API key', 500);
  }
};

// ─── Get API call logs for the user ──────────────────────────────────────────
export const getApiLogs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const [rows] = await db.query(
      `SELECT id, endpoint, method, status_code, status, ip_address, response_summary, created_at
       FROM api_logs
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [req.user.id, limit]
    );
    return successResponse(res, rows);
  } catch (error) {
    console.error('getApiLogs error:', error);
    return errorResponse(res, 'Failed to fetch API logs', 500);
  }
};

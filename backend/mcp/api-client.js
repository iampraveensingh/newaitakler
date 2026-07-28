import axios from 'axios';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';

let cachedJwt = null;
let jwtExpiresAt = 0;

export async function resolveUserId(req) {
  const apiKey = req.headers?.['x-api-key'] ||
    (() => { try { return JSON.parse(req.headers?.['extra-headers'] || '{}')['X-Api-Key']; } catch { return null; } })();

  if (!apiKey) return null;

  const [rows] = await db.query(
    'SELECT user_id FROM user_api_keys WHERE api_key = ?',
    [apiKey]
  );
  if (!rows.length) return null;

  await db.query('UPDATE user_api_keys SET last_used_at = NOW() WHERE api_key = ?', [apiKey]);
  return rows[0].user_id;
}

export async function getUserById(userId) {
  const [[user]] = await db.query(
    `SELECT id, username, email, full_name, role, base_plan, addons, billing_product_ids,
            agency_owner_id, credits_balance
     FROM users WHERE id = ? AND is_active = 1`,
    [userId]
  );
  if (!user) return null;
  if (typeof user.addons === 'string') {
    try { user.addons = JSON.parse(user.addons); } catch { user.addons = {}; }
  }
  if (typeof user.billing_product_ids === 'string') {
    try { user.billing_product_ids = JSON.parse(user.billing_product_ids); } catch { user.billing_product_ids = []; }
  }
  return user;
}

export function issueInternalJwt(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

export function createApiClient(baseUrl, jwtToken) {
  const client = axios.create({
    baseURL: baseUrl,
    timeout: 120_000,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwtToken}`,
    },
  });
  return client;
}

import bcrypt from 'bcryptjs';
import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

// ─── Helper ───────────────────────────────────────────────────────────────────
const SAFE_USER_FIELDS = 'id, username, email, full_name, role, base_plan, addons, credits_balance, is_active, created_at, last_login_at';

function parseAddons(row) {
  if (!row) return row;
  const clone = { ...row };
  if (typeof clone.addons === 'string') {
    try { clone.addons = JSON.parse(clone.addons); } catch { clone.addons = {}; }
  }
  return clone;
}

// ─── Require AGENCY addon middleware ─────────────────────────────────────────
export const requireAgencyAddon = (req, res, next) => {
  const user = req.user;
  let addons = user.addons;
  if (typeof addons === 'string') { try { addons = JSON.parse(addons); } catch { addons = {}; } }

  const hasAgency = addons?.AGENCY === true || addons?.agency === true;
  if (!hasAgency) {
    return errorResponse(res, 'Agency addon is required. Please upgrade to access Agency features.', 403);
  }
  next();
};

// ─── List agency sub-users ────────────────────────────────────────────────────
export const listAgencyUsers = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ${SAFE_USER_FIELDS} FROM users WHERE agency_owner_id = ? AND is_active = 1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    return successResponse(res, rows.map(parseAddons));
  } catch (error) {
    console.error('listAgencyUsers error:', error);
    return errorResponse(res, 'Failed to list agency users', 500);
  }
};

// ─── Create agency sub-user ───────────────────────────────────────────────────
export const createAgencyUser = async (req, res) => {
  const { username, email, full_name, password, credits_balance = 0 } = req.body;

  if (!username || !password) {
    return errorResponse(res, 'Username and password are required', 400);
  }
  if (password.length < 6) {
    return errorResponse(res, 'Password must be at least 6 characters', 400);
  }

  try {
    // Check username uniqueness
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return errorResponse(res, 'Username already taken. Please choose another.', 409);
    }

    // Get the admin's plan so sub-user inherits same plan
    const adminUser = req.user;
    const initialCredits = Math.max(0, parseInt(credits_balance) || 0);

    // Check admin has enough credits to cover the initial allocation
    if (initialCredits > 0) {
      const adminBalance = parseInt(adminUser.credits_balance) || 0;
      if (adminBalance < initialCredits) {
        return errorResponse(res, `Insufficient credits. You have ${adminBalance} credits available but need ${initialCredits}.`, 400);
      }
    }

    const password_hash = await bcrypt.hash(password, 10);
    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await db.query(
      `INSERT INTO users (
        username, email, full_name, password_hash, role, base_plan, addons,
        agency_owner_id, credits_balance, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'user', ?, '{}', ?, ?, 1, ?, ?)`,
      [
        username,
        email || null,
        full_name || username,
        password_hash,
        adminUser.base_plan,
        req.user.id,
        initialCredits,
        nowIso,
        nowIso,
      ]
    );

    // Deduct initial credits from admin's balance
    if (initialCredits > 0) {
      await db.query(
        'UPDATE users SET credits_balance = credits_balance - ?, updated_at = NOW() WHERE id = ?',
        [initialCredits, req.user.id]
      );
    }

    const [rows] = await db.query(
      `SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`,
      [result.insertId]
    );
    return successResponse(res, parseAddons(rows[0]), 'Agency user created successfully', 201);
  } catch (error) {
    console.error('createAgencyUser error:', error);
    return errorResponse(res, 'Failed to create agency user', 500);
  }
};

// ─── Update agency sub-user ───────────────────────────────────────────────────
export const updateAgencyUser = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, password } = req.body;

  try {
    // Verify the sub-user belongs to this admin
    const [rows] = await db.query(
      'SELECT id FROM users WHERE id = ? AND agency_owner_id = ?',
      [id, req.user.id]
    );
    if (!rows.length) {
      return errorResponse(res, 'Agency user not found', 404);
    }

    const updates = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (password) {
      if (password.length < 6) return errorResponse(res, 'Password must be at least 6 characters', 400);
      updates.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse(res, 'No fields to update', 400);
    }

    const setParts = Object.entries(updates).map(([k]) => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), id];
    await db.query(`UPDATE users SET ${setParts}, updated_at = NOW() WHERE id = ?`, values);

    const [updated] = await db.query(`SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`, [id]);
    return successResponse(res, parseAddons(updated[0]), 'Agency user updated');
  } catch (error) {
    console.error('updateAgencyUser error:', error);
    return errorResponse(res, 'Failed to update agency user', 500);
  }
};

// ─── Remove (deactivate) agency sub-user ─────────────────────────────────────
export const removeAgencyUser = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT id, credits_balance FROM users WHERE id = ? AND agency_owner_id = ?',
      [id, req.user.id]
    );
    if (!rows.length) {
      return errorResponse(res, 'Agency user not found', 404);
    }

    // Refund remaining credits back to admin before deactivating
    const remainingCredits = parseInt(rows[0].credits_balance) || 0;
    if (remainingCredits > 0) {
      await db.query(
        'UPDATE users SET credits_balance = credits_balance + ?, updated_at = NOW() WHERE id = ?',
        [remainingCredits, req.user.id]
      );
    }

    await db.query('UPDATE users SET is_active = 0, credits_balance = 0, updated_at = NOW() WHERE id = ?', [id]);
    return successResponse(res, null, 'Agency user removed');
  } catch (error) {
    console.error('removeAgencyUser error:', error);
    return errorResponse(res, 'Failed to remove agency user', 500);
  }
};

// ─── Allocate credits to sub-user ────────────────────────────────────────────
export const allocateCredits = async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || isNaN(amount) || parseInt(amount) < 0) {
    return errorResponse(res, 'A valid non-negative credit amount is required', 400);
  }

  try {
    const [rows] = await db.query(
      'SELECT id, credits_balance FROM users WHERE id = ? AND agency_owner_id = ? AND is_active = 1',
      [id, req.user.id]
    );
    if (!rows.length) {
      return errorResponse(res, 'Agency user not found', 404);
    }

    const newBalance = parseInt(amount);
    const existingBalance = parseInt(rows[0].credits_balance) || 0;
    const delta = newBalance - existingBalance;

    if (delta > 0) {
      // Allocating more credits — check admin has enough
      const [[adminRow]] = await db.query('SELECT credits_balance FROM users WHERE id = ?', [req.user.id]);
      const adminBalance = parseInt(adminRow.credits_balance) || 0;
      if (adminBalance < delta) {
        return errorResponse(res, `Insufficient credits. You have ${adminBalance} credits available but need ${delta} more.`, 400);
      }
      await db.query(
        'UPDATE users SET credits_balance = credits_balance - ?, updated_at = NOW() WHERE id = ?',
        [delta, req.user.id]
      );
    } else if (delta < 0) {
      // Reducing allocation — return freed credits to admin
      await db.query(
        'UPDATE users SET credits_balance = credits_balance + ?, updated_at = NOW() WHERE id = ?',
        [Math.abs(delta), req.user.id]
      );
    }

    await db.query(
      'UPDATE users SET credits_balance = ?, updated_at = NOW() WHERE id = ?',
      [newBalance, id]
    );

    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const monthYear = new Date().toISOString().slice(0, 7);

    // Ensure a usage record exists for this sub-user this month
    await db.query(
      `INSERT INTO user_usage_monthly (user_id, month_year, credits_used, created_at, updated_at)
       VALUES (?, ?, 0, ?, ?)
       ON DUPLICATE KEY UPDATE updated_at = NOW()`,
      [id, monthYear, nowIso, nowIso]
    );

    const [updated] = await db.query(`SELECT ${SAFE_USER_FIELDS} FROM users WHERE id = ?`, [id]);
    return successResponse(res, parseAddons(updated[0]), `Credits set to ${newBalance}`);
  } catch (error) {
    console.error('allocateCredits error:', error);
    return errorResponse(res, 'Failed to allocate credits', 500);
  }
};

// ─── Get agency stats ─────────────────────────────────────────────────────────
export const getAgencyStats = async (req, res) => {
  try {
    const monthYear = new Date().toISOString().slice(0, 7);

    // Count sub-users
    const [[{ total_users }]] = await db.query(
      'SELECT COUNT(*) AS total_users FROM users WHERE agency_owner_id = ? AND is_active = 1',
      [req.user.id]
    );

    // Total credits allocated to all sub-users
    const [[{ total_credits_allocated }]] = await db.query(
      'SELECT COALESCE(SUM(credits_balance), 0) AS total_credits_allocated FROM users WHERE agency_owner_id = ? AND is_active = 1',
      [req.user.id]
    );

    // Total credits used this month by all sub-users
    const [[{ total_credits_used }]] = await db.query(
      `SELECT COALESCE(SUM(m.credits_used), 0) AS total_credits_used
       FROM user_usage_monthly m
       INNER JOIN users u ON u.id = m.user_id
       WHERE u.agency_owner_id = ? AND m.month_year = ?`,
      [req.user.id, monthYear]
    );

    // Per-user usage this month
    const [userUsage] = await db.query(
      `SELECT u.id, u.username, u.full_name, u.email, u.credits_balance,
              COALESCE(m.credits_used, 0) AS credits_used,
              COALESCE(m.clones_used, 0) AS clones_used,
              COALESCE(m.vsl_used, 0) AS vsl_used,
              COALESCE(m.ad_used, 0) AS ad_used,
              COALESCE(m.transcriptions_used, 0) AS transcriptions_used,
              u.last_login_at
       FROM users u
       LEFT JOIN user_usage_monthly m ON m.user_id = u.id AND m.month_year = ?
       WHERE u.agency_owner_id = ? AND u.is_active = 1
       ORDER BY u.created_at DESC`,
      [monthYear, req.user.id]
    );

    return successResponse(res, {
      total_users,
      total_credits_allocated,
      total_credits_used,
      month_year: monthYear,
      users: userUsage,
    });
  } catch (error) {
    console.error('getAgencyStats error:', error);
    return errorResponse(res, 'Failed to get agency stats', 500);
  }
};

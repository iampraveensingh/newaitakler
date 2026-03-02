import axios from 'axios';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

const LOGIN_URL = process.env.PROWEBVENTURES_LOGIN_URL || 'https://systems.prowebventures.com/login44.php';

// ─── Helper: issue JWT and build response payload ─────────────────────────────
function issueToken(user, addons) {
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      username: user.username,
      role: user.role,
      base_plan: user.base_plan,
      addons,
      agency_owner_id: user.agency_owner_id || null,
      credits_balance: user.credits_balance || 0,
    },
  };
}

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return errorResponse(res, 'Username and password are required', 400);
  }

  try {
    // ── Step 0: Check for agency sub-user (local bcrypt auth) ────────────────
    const [probeRows] = await db.query(
      'SELECT * FROM users WHERE username = ? AND is_active = 1',
      [username]
    );
    const probeUser = probeRows[0];

    if (probeUser && probeUser.password_hash && probeUser.agency_owner_id) {
      // Agency sub-user — authenticate locally via bcrypt
      const passwordValid = await bcrypt.compare(password, probeUser.password_hash);
      if (!passwordValid) {
        return errorResponse(res, 'Invalid username or password.', 401);
      }

      const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await db.query('UPDATE users SET last_login_at = ? WHERE id = ?', [nowIso, probeUser.id]);

      const [refreshed] = await db.query('SELECT * FROM users WHERE id = ?', [probeUser.id]);
      const user = refreshed[0];
      let addons = user.addons;
      if (typeof addons === 'string') { try { addons = JSON.parse(addons); } catch { addons = {}; } }

      return successResponse(res, issueToken(user, addons), 'Login successful');
    }

    // ── Step 1: Call external authentication endpoint (ProWebVentures users) ─
    let data;
    try {
      const externalResponse = await axios.get(
        `${LOGIN_URL}?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        { timeout: 15000 }
      );
      data = externalResponse.data;
    } catch (networkError) {
      return errorResponse(res, 'Login failed: authentication server error. Please try again.', 503);
    }

    console.log('External auth response:', data);

    // Step 2: Check for error indicators in response
    const isError = data.error === true ||
                    data.success === false ||
                    data.status === 'error' ||
                    (data.message && /fail|invalid|wrong|incorrect|denied|unauthorized/i.test(data.message));

    if (isError) {
      const message = data.message || 'Authentication failed.';
      return errorResponse(res, message, 401);
    }

    // Step 3: Extract active product IDs
    const now = new Date();
    const today = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;

    const extractActiveProducts = (obj) => {
      if (typeof obj !== 'object' || obj === null) return [];
      return Object.entries(obj)
        .filter(([, endDate]) => endDate && endDate >= today)
        .map(([productId]) => productId);
    };

    let productIds = [];
    if (data.subscriptions) productIds.push(...extractActiveProducts(data.subscriptions));
    if (data.categories) productIds.push(...extractActiveProducts(data.categories));
    productIds = [...new Set(productIds)].filter(Boolean);

    if (productIds.length === 0) {
      return errorResponse(res, 'No active products found on your account. Please contact support.', 403);
    }

    // Step 4: Map product IDs to entitlements
    const [entitlementRows] = await db.query('SELECT * FROM product_entitlements');
    const mappedEntitlements = productIds
      .map(pid => entitlementRows.find(e => e.product_id === pid))
      .filter(Boolean);

    if (mappedEntitlements.length === 0) {
      return errorResponse(res, 'Your Product ID is not mapped in the app. Please contact support.', 403);
    }

    // Step 5: Determine base plan (highest priority LOGIN_PLAN)
    const [planRows] = await db.query('SELECT * FROM plans');
    const planPriorities = {};
    planRows.forEach(p => { planPriorities[p.name] = p.priority; });

    const loginPlans = mappedEntitlements.filter(e => e.entitlement_type === 'LOGIN_PLAN');
    const addonEntitlements = mappedEntitlements.filter(e => e.entitlement_type === 'ADDON');

    let basePlan = 'NONE';
    let highestPriority = -1;
    for (const ent of loginPlans) {
      const priority = planPriorities[ent.code] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        basePlan = ent.code;
      }
    }

    if (basePlan === 'NONE' && addonEntitlements.length > 0) {
      return errorResponse(res, 'You have upsell access, but you need FE, PRO, or XTREME to login.', 403);
    }

    // Step 6: Build addons object
    const addons = {};
    addonEntitlements.forEach(addon => { addons[addon.code] = true; });

    // Step 7: Upsert user record
    const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [userLookup] = await db.query('SELECT id FROM users WHERE username = ?', [username]);

    let userId;
    if (userLookup.length > 0) {
      userId = userLookup[0].id;
      await db.query(
        `UPDATE users SET base_plan = ?, addons = ?, billing_product_ids = ?,
         plan_updated_at = ?, last_login_at = ?, auth_last_status = 'success',
         auth_last_code = 'OK', auth_last_message = 'Login successful' WHERE id = ?`,
        [basePlan, JSON.stringify(addons), JSON.stringify(productIds), nowIso, nowIso, userId]
      );
    } else {
      const [insertResult] = await db.query(
        `INSERT INTO users (username, email, full_name, role, base_plan, addons, billing_product_ids,
         plan_updated_at, last_login_at, auth_last_status, auth_last_code, is_active, created_at, updated_at)
         VALUES (?, ?, ?, 'admin', ?, ?, ?, ?, ?, 'success', 'OK', 1, ?, ?)`,
        [
          username,
          data.email || `${username}@placeholder.com`,
          data.full_name || username,
          basePlan,
          JSON.stringify(addons),
          JSON.stringify(productIds),
          nowIso,
          nowIso,
          nowIso,
          nowIso,
        ]
      );
      userId = insertResult.insertId;
    }

    // Step 8: Get full user record and issue JWT
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = userRows[0];
    let userAddons = user.addons;
    if (typeof userAddons === 'string') { try { userAddons = JSON.parse(userAddons); } catch { userAddons = {}; } }

    return successResponse(res, issueToken(user, userAddons), 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'An unexpected error occurred. Please try again.', 500);
  }
};

export const checkAuth = async (req, res) => {
  return successResponse(res, { authenticated: true }, 'Token valid');
};

export const logout = async (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
};

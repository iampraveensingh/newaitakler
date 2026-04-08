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

    console.log('[AUTH] External auth response:', JSON.stringify(data, null, 2));

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

    console.log('[AUTH] Step 3 — Active product IDs from ProWebVentures:', productIds);

    if (productIds.length === 0) {
      return errorResponse(res, 'No active products found on your account. Please contact support.', 403);
    }

    // Step 4: Map product IDs to entitlements
    const [entitlementRows] = await db.query('SELECT * FROM product_entitlements');
    console.log('[AUTH] Step 4 — All entries in product_entitlements:', entitlementRows.map(e => ({ product_id: e.product_id, type: e.entitlement_type, code: e.code })));

    const mappedEntitlements = productIds
      .map(pid => entitlementRows.find(e => e.product_id === pid))
      .filter(Boolean);
    console.log('[AUTH] Step 4 — Matched entitlements:', mappedEntitlements.map(e => ({ product_id: e.product_id, type: e.entitlement_type, code: e.code })));

    const unmappedIds = productIds.filter(pid => !entitlementRows.find(e => e.product_id === pid));
    if (unmappedIds.length > 0) console.log('[AUTH] Step 4 — Unmapped product IDs (not in product_entitlements):', unmappedIds);

    if (mappedEntitlements.length === 0) {
      return errorResponse(res, 'Your Product ID is not mapped in the app. Please contact support.', 403);
    }

    // Step 5: Determine base plan (highest priority LOGIN_PLAN)
    const [planRows] = await db.query('SELECT * FROM plans');
    const planPriorities = {};
    // Normalize to uppercase so 'Pro', 'PRO', 'pro' all map correctly
    planRows.forEach(p => { planPriorities[p.name.toUpperCase()] = p.priority; });
    console.log('[AUTH] Step 5 — Plan priorities from DB (normalized):', planPriorities);

    const loginPlans = mappedEntitlements.filter(e => e.entitlement_type === 'LOGIN_PLAN');
    const addonEntitlements = mappedEntitlements.filter(e => e.entitlement_type === 'ADDON');
    console.log('[AUTH] Step 5 — LOGIN_PLANs found:', loginPlans.map(e => e.code));
    console.log('[AUTH] Step 5 — ADDONs found:', addonEntitlements.map(e => e.code));

    let basePlan = 'NONE';
    let highestPriority = -1;
    for (const ent of loginPlans) {
      const priority = planPriorities[ent.code] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        basePlan = ent.code;
      }
    }
    console.log('[AUTH] Step 5 — Selected basePlan:', basePlan, '(priority:', highestPriority + ')');

    // Any recognized LOGIN_PLAN grants access
    const ACCESS_PLANS = ['FE', 'XTREME', 'PRO', 'UNLIMITED', 'ALLACCESS'];
    const hasBaseAccess = loginPlans.some(e => ACCESS_PLANS.includes((e.code || '').toUpperCase()));
    if (loginPlans.length > 0 && !hasBaseAccess) {
      return errorResponse(res, 'Your product does not grant access. Please contact support.', 403);
    }

    if (basePlan === 'NONE') {
      return errorResponse(res, 'No access plan found on your account. Please contact support.', 403);
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
      // If plan changed to a higher tier, top up credits_balance to the new plan's limit
      const [[existingUser]] = await db.query('SELECT base_plan, credits_balance FROM users WHERE id = ?', [userId]);
      const [[planLimitRow]] = await db.query('SELECT credits FROM plan_limits WHERE plan_id = ?', [basePlan]);
      const planCredits = planLimitRow?.credits ?? 1000;
      // -1 means unlimited — store as -1 in credits_balance as sentinel
      // Only top up if credits_balance is 0 (new/depleted) or plan upgraded
      const creditsUpdate = (existingUser.credits_balance === 0 || existingUser.base_plan !== basePlan)
        ? `, credits_balance = ${planCredits}` : '';

      await db.query(
        `UPDATE users SET base_plan = ?, addons = ?, billing_product_ids = ?,
         plan_updated_at = ?, last_login_at = ?, auth_last_status = 'success',
         auth_last_code = 'OK', auth_last_message = 'Login successful'${creditsUpdate} WHERE id = ?`,
        [basePlan, JSON.stringify(addons), JSON.stringify(productIds), nowIso, nowIso, userId]
      );
    } else {
      // Seed initial credits_balance from plan_limits
      const [[planLimitRow]] = await db.query(
        'SELECT credits FROM plan_limits WHERE plan_id = ?', [basePlan]
      );
      // -1 means unlimited — keep as -1
      const initialCredits = planLimitRow?.credits ?? 1000;

      const [insertResult] = await db.query(
        `INSERT INTO users (username, email, full_name, role, base_plan, addons, billing_product_ids,
         credits_balance, plan_updated_at, last_login_at, auth_last_status, auth_last_code, is_active, created_at, updated_at)
         VALUES (?, ?, ?, 'admin', ?, ?, ?, ?, ?, ?, 'success', 'OK', 1, ?, ?)`,
        [
          username,
          data.email || `${username}@placeholder.com`,
          data.full_name || username,
          basePlan,
          JSON.stringify(addons),
          JSON.stringify(productIds),
          initialCredits,
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

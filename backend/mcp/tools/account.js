import { z } from 'zod';
import axios from 'axios';
import { db } from '../../config/database.js';

const SERVER_LOAD_URL = 'https://srv16.aisoftllc.com/apis/check_serverload.php';

export function registerAccountTools(server, { getUserCtx }) {

  server.tool(
    'get_usage',
    'Get current month usage across all features (credits, clones, VSL, ad copies, transcriptions, etc.).',
    {
      month_year: z.string().regex(/^\d{4}-\d{2}$/).optional()
        .describe('Month in YYYY-MM format (defaults to current month)'),
    },
    async ({ month_year }, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      const my = month_year || new Date().toISOString().slice(0, 7);
      const [rows] = await db.query(
        'SELECT * FROM user_usage_monthly WHERE user_id = ? AND month_year = ?',
        [userId, my]
      );
      return {
        content: [{ type: 'text', text: JSON.stringify(rows[0] || { message: 'No usage recorded this month.' }, null, 2) }],
      };
    }
  );

  server.tool(
    'get_plan_limits',
    "Get the feature limits for the user's current plan (credits, clones, VSL, etc.).",
    {},
    async (_params, extra) => {
      const { user, userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      const plan = (user.base_plan || 'FE').toUpperCase();
      const [rows] = await db.query('SELECT * FROM plan_limits WHERE plan_id = ?', [plan]);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            plan,
            addons: user.addons || {},
            limits: rows[0] || {},
          }, null, 2),
        }],
      };
    }
  );

  server.tool(
    'get_user_profile',
    'Get the authenticated user profile including plan, role, credits balance, and addons.',
    {},
    async (_params, extra) => {
      const { user, userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            base_plan: user.base_plan,
            addons: user.addons,
            agency_owner_id: user.agency_owner_id || null,
            credits_balance: user.credits_balance || 0,
          }, null, 2),
        }],
      };
    }
  );

  server.tool(
    'check_server_status',
    'Check if the TTS voice generation server is available and not under heavy load.',
    {},
    async () => {
      try {
        const { data } = await axios.get(SERVER_LOAD_URL, { timeout: 5000 });
        const isFree = data?.free === true;
        return {
          content: [{
            type: 'text',
            text: isFree
              ? 'TTS server is available and ready for voice generation.'
              : 'TTS server is currently busy. Try again in a few moments.',
          }],
        };
      } catch {
        return { content: [{ type: 'text', text: 'Unable to reach TTS server.' }], isError: true };
      }
    }
  );

  server.tool(
    'get_api_logs',
    'View recent API call logs (method, status, IP, timestamp).',
    { limit: z.number().max(200).default(50).describe('Maximum number of log entries to return') },
    async ({ limit }, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      const [rows] = await db.query(
        `SELECT id, endpoint, method, status_code, status, ip_address, response_summary, created_at
         FROM api_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        [userId, limit]
      );
      return { content: [{ type: 'text', text: JSON.stringify({ count: rows.length, logs: rows }, null, 2) }] };
    }
  );
}

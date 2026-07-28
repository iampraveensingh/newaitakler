import { db } from '../../config/database.js';
import axios from 'axios';

export function registerResources(server, { getUserCtx }) {

  server.resource(
    'user-profile',
    'aitalker://user/profile',
    { description: 'Current user plan, role, addons, and credits balance' },
    async (uri, extra) => {
      const { user, userId } = await getUserCtx(extra);
      if (!user) return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: 'Not authenticated' }] };

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            base_plan: user.base_plan,
            addons: user.addons,
            credits_balance: user.credits_balance || 0,
            agency_owner_id: user.agency_owner_id || null,
          }, null, 2),
        }],
      };
    }
  );

  server.resource(
    'available-voices',
    'aitalker://voices/available',
    { description: 'All voices the user can use (system + cloned + custom)' },
    async (uri, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: 'Not authenticated' }] };

      const [system] = await db.query(
        'SELECT id, name, type, description, audio_url FROM system_voices WHERE is_active = 1 ORDER BY sort_order'
      );
      const [cloned] = await db.query(
        `SELECT id, name, audio_url, 'cloned' AS voice_type, status FROM voice_clones
         WHERE user_id = ? AND status IN ('ready','completed') ORDER BY created_at DESC`,
        [userId]
      );
      const [custom] = await db.query(
        `SELECT id, name, audio_url, 'custom' AS voice_type, status FROM custom_voices
         WHERE user_id = ? AND status = 'ready' ORDER BY created_at DESC`,
        [userId]
      );

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            system: system,
            cloned: cloned,
            custom: custom,
            total: system.length + cloned.length + custom.length,
          }, null, 2),
        }],
      };
    }
  );

  server.resource(
    'usage-summary',
    'aitalker://user/usage',
    { description: 'Current month usage vs plan limits' },
    async (uri, extra) => {
      const { user, userId } = await getUserCtx(extra);
      if (!userId) return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: 'Not authenticated' }] };

      const monthYear = new Date().toISOString().slice(0, 7);
      const [usage] = await db.query(
        'SELECT * FROM user_usage_monthly WHERE user_id = ? AND month_year = ?',
        [userId, monthYear]
      );
      const plan = (user.base_plan || 'FE').toUpperCase();
      const [limits] = await db.query('SELECT * FROM plan_limits WHERE plan_id = ?', [plan]);

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            month: monthYear,
            plan,
            usage: usage[0] || {},
            limits: limits[0] || {},
          }, null, 2),
        }],
      };
    }
  );

  server.resource(
    'server-status',
    'aitalker://server/status',
    { description: 'TTS server availability and queue status' },
    async (uri) => {
      let serverFree = false;
      let queueData = null;
      try {
        const { data } = await axios.get('https://srv16.aisoftllc.com/apis/check_serverload.php', { timeout: 5000 });
        serverFree = data?.free === true;
      } catch {}

      try {
        const { data } = await axios.post(
          process.env.HUMAN_VOICE_API_URL || 'https://srv16.aisoftllc.com/apis/prompt_api.php',
          JSON.stringify({ api_key: process.env.TTS_API_KEY, check_task: '1' }),
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );
        if (data?.running_count !== undefined) {
          queueData = { running: data.running_count, pending: data.pending_count || 0 };
        }
      } catch {}

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify({
            tts_server: serverFree ? 'available' : 'busy',
            queue: queueData,
          }, null, 2),
        }],
      };
    }
  );
}

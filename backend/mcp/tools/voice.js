import { z } from 'zod';
import axios from 'axios';
import { db } from '../../config/database.js';

const TTS_API_URL = 'https://srv16.aisoftllc.com/apis/api_tts.php';
const SERVER_LOAD_URL = 'https://srv16.aisoftllc.com/apis/check_serverload.php';

export function registerVoiceTools(server, { getUserCtx }) {

  server.tool(
    'generate_voiceover',
    'Generate a voiceover from text using a selected voice. Validates credits, checks server load, calls TTS API, and returns the audio URL.',
    {
      voice_url: z.string().describe('Audio URL of the voice to use (from list_voices or list_system_voices)'),
      tts_text: z.string().min(1).max(10000).describe('The text to convert to speech'),
      emotion: z.enum(['neutral', 'happy', 'sad', 'excited', 'calm', 'serious']).default('neutral')
        .describe('Emotional tone of the generated voice'),
    },
    async ({ voice_url, tts_text, emotion }, extra) => {
      const { user, userId } = await getUserCtx(extra);
      if (!user) return { content: [{ type: 'text', text: 'Error: Invalid API key or user not found.' }], isError: true };

      const plan = (user.base_plan || 'FE').toUpperCase();
      let addons = user.addons || {};
      const wordCount = tts_text.trim().split(/\s+/).filter(Boolean).length;

      const isUnlimited = plan === 'BUNDLE' || plan === 'ALLACCESS' || plan === 'UNLIMITED'
        || addons.UNLIMITED === true || addons.unlimited === true
        || addons.BUNDLE === true || addons.bundle === true
        || addons.ALLACCESS === true || addons.allaccess === true;

      if (!isUnlimited) {
        if (user.agency_owner_id) {
          const remaining = parseInt(user.credits_balance) || 0;
          if (wordCount > remaining) {
            return { content: [{ type: 'text', text: `Insufficient credits. Need ${wordCount}, have ${remaining}.` }], isError: true };
          }
        } else {
          const monthYear = new Date().toISOString().slice(0, 7);
          const [[usage]] = await db.query(
            'SELECT credits_used FROM user_usage_monthly WHERE user_id = ? AND month_year = ?',
            [userId, monthYear]
          );
          const [[limits]] = await db.query('SELECT credits FROM plan_limits WHERE plan_id = ?', [plan]);
          const creditsUsed = parseInt(usage?.credits_used) || 0;
          const creditsLimit = parseInt(limits?.credits) || 1000;
          if (creditsUsed + wordCount > creditsLimit) {
            const remaining = Math.max(0, creditsLimit - creditsUsed);
            return { content: [{ type: 'text', text: `Monthly credit limit reached. Need ${wordCount}, have ${remaining} remaining.` }], isError: true };
          }
        }
      }

      try {
        const { data: loadData } = await axios.get(SERVER_LOAD_URL, { timeout: 5000 });
        if (loadData?.free !== true) {
          return { content: [{ type: 'text', text: 'TTS server is currently busy. Please try again shortly.' }], isError: true };
        }
      } catch {
        return { content: [{ type: 'text', text: 'TTS server is unreachable. Please try again later.' }], isError: true };
      }

      const ttsResponse = await axios.post(TTS_API_URL, {
        api_key: process.env.TTS_API_KEY,
        mode: 'voiceover',
        prompt: 'voiceover',
        audio_url: voice_url,
        tts_text,
        emotion,
      }, { headers: { 'Content-Type': 'application/json' }, timeout: 120_000 });

      const result = ttsResponse.data;
      const outputUrl = result?.data?.output_url || result?.output_url;
      if (!outputUrl) {
        return { content: [{ type: 'text', text: `TTS API error: ${result?.message || 'No output URL returned.'}` }], isError: true };
      }

      // Download and save locally
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const ext = outputUrl.endsWith('.wav') ? 'wav' : 'mp3';
      const filename = `mcp_voice_${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
      const filePath = path.join(uploadDir, filename);

      const audioResponse = await axios.get(outputUrl, { responseType: 'arraybuffer', timeout: 60_000 });
      fs.writeFileSync(filePath, Buffer.from(audioResponse.data));

      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const localUrl = `${baseUrl}/uploads/${filename}`;

      // Deduct credits
      if (!isUnlimited) {
        const monthYear = new Date().toISOString().slice(0, 7);
        const nowIso = new Date().toISOString().slice(0, 19).replace('T', ' ');
        await db.query(
          `INSERT INTO user_usage_monthly (user_id, month_year, credits_used, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE credits_used = credits_used + ?, updated_at = NOW()`,
          [userId, monthYear, wordCount, nowIso, nowIso, wordCount]
        );
        if (user.agency_owner_id) {
          await db.query(
            'UPDATE users SET credits_balance = GREATEST(0, credits_balance - ?), updated_at = NOW() WHERE id = ?',
            [wordCount, userId]
          );
        }
      }

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            audio_url: localUrl,
            filename,
            credits_used: isUnlimited ? 0 : wordCount,
            word_count: wordCount,
          }, null, 2),
        }],
      };
    }
  );

  server.tool(
    'list_voices',
    'List all available voices (cloned + custom) for the authenticated user.',
    {},
    async (_params, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      const [clones] = await db.query(
        `SELECT id AS voice_id, name AS voice_name, audio_url AS voice_url, 'cloned' AS voice_type, status, created_at
         FROM voice_clones WHERE user_id = ? AND status IN ('ready','completed') ORDER BY created_at DESC`,
        [userId]
      );
      const [customs] = await db.query(
        `SELECT id AS voice_id, name AS voice_name, audio_url AS voice_url, 'custom' AS voice_type, status, created_at
         FROM custom_voices WHERE user_id = ? AND status = 'ready' ORDER BY created_at DESC`,
        [userId]
      );

      const voices = [...clones, ...customs];
      return {
        content: [{ type: 'text', text: JSON.stringify({ count: voices.length, voices }, null, 2) }],
      };
    }
  );

  server.tool(
    'list_system_voices',
    'List shared studio voices available to all users (Sarah, Emma, Alex, etc.).',
    {},
    async () => {
      const [voices] = await db.query(
        'SELECT id, name, type, description, audio_url, sort_order FROM system_voices WHERE is_active = 1 ORDER BY sort_order'
      );
      return {
        content: [{ type: 'text', text: JSON.stringify({ count: voices.length, voices }, null, 2) }],
      };
    }
  );
}

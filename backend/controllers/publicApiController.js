import fs      from 'fs';
import path    from 'path';
import { fileURLToPath } from 'url';
import axios   from 'axios';
import { db }  from '../config/database.js';

const __dirname       = path.dirname(fileURLToPath(import.meta.url));
const TTS_API_URL     = 'https://srv16.aisoftllc.com/apis/api_tts.php';
const SERVER_LOAD_URL = 'https://srv16.aisoftllc.com/apis/check_serverload.php';

// ─── Helper: check if the TTS server is free ─────────────────────────────────
async function isTtsServerFree() {
  try {
    const { data } = await axios.get(SERVER_LOAD_URL, { timeout: 5_000 });
    return data?.free === true;
  } catch {
    return false; // treat unreachable as busy
  }
}

// ─── Helper: write an API log entry ──────────────────────────────────────────
async function logCall({ userId, endpoint, method, statusCode, status, ip, summary }) {
  try {
    await db.query(
      `INSERT INTO api_logs
         (user_id, endpoint, method, status_code, status, ip_address, response_summary, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId ?? null, endpoint, method, statusCode, status, ip, summary]
    );
  } catch (e) {
    console.error('[api_logs] write failed:', e.message);
  }
}

// ─── Helper: extract real client IP ──────────────────────────────────────────
function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (fwd ? fwd.split(',')[0] : req.socket?.remoteAddress || 'unknown').trim();
}

// ─── POST /api/v1/voices ─────────────────────────────────────────────────────
// Public endpoint — authenticated via X-API-Key header (no JWT required).
// Returns the caller's cloned and custom voices.
export const fetchVoices = async (req, res) => {
  const endpoint = 'POST /api/v1/voices';
  const method   = 'POST';
  const ip       = clientIp(req);

  // 1. Require API key header
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    await logCall({ userId: null, endpoint, method, statusCode: 401, status: 'failed', ip, summary: 'Missing X-API-Key header' });
    return res.status(401).json({
      success: false,
      message: 'Missing X-API-Key header. Add your API key to authenticate.',
    });
  }

  try {
    // 2. Validate API key against DB
    const [keyRows] = await db.query(
      'SELECT user_id FROM user_api_keys WHERE api_key = ?',
      [apiKey]
    );

    if (!keyRows.length) {
      await logCall({ userId: null, endpoint, method, statusCode: 401, status: 'failed', ip, summary: 'Invalid or revoked API key' });
      return res.status(401).json({ success: false, message: 'Invalid or revoked API key.' });
    }

    const userId = keyRows[0].user_id;

    // 3. Stamp last_used_at
    await db.query(
      'UPDATE user_api_keys SET last_used_at = NOW() WHERE api_key = ?',
      [apiKey]
    );

    // 4. Fetch cloned voices (ready/completed)
    const [clones] = await db.query(
      `SELECT
         id         AS voice_id,
         name       AS voice_name,
         audio_url  AS voice_url,
         'cloned'   AS voice_type,
         status,
         created_at
       FROM voice_clones
       WHERE user_id = ? AND status IN ('ready','completed')
       ORDER BY created_at DESC`,
      [userId]
    );

    // 5. Fetch custom AI voices (completed)
    const [customs] = await db.query(
      `SELECT
         id         AS voice_id,
         name       AS voice_name,
         audio_url  AS voice_url,
         'custom'   AS voice_type,
         status,
         created_at
       FROM custom_voices
       WHERE user_id = ? AND status = 'ready'
       ORDER BY created_at DESC`,
      [userId]
    );

    const voices = [...clones, ...customs];

    await logCall({
      userId,
      endpoint,
      method,
      statusCode: 200,
      status:     'success',
      ip,
      summary:    `Returned ${voices.length} voice(s)`,
    });

    return res.json({
      success: true,
      count:   voices.length,
      voices,
    });

  } catch (error) {
    console.error('fetchVoices error:', error);
    await logCall({ userId: null, endpoint, method, statusCode: 500, status: 'failed', ip, summary: 'Internal server error' });
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// ─── POST /api/v1/generate ───────────────────────────────────────────────────
// Public endpoint — authenticated via X-API-Key header (no JWT required).
// Generates a voiceover by calling the external TTS API, downloads the audio,
// saves it locally, and returns the hosted audio URL.
//
// Request body:
//   { voice_url, tts_text, emotion? }
//   voice_url  — audio_url of the cloned/custom voice (from /api/v1/voices)
//   tts_text   — the script text to convert to speech
//   emotion    — optional: neutral | happy | sad | excited | calm | serious (default: neutral)
export const generateVoice = async (req, res) => {
  const endpoint = 'POST /api/v1/generate';
  const method   = 'POST';
  const ip       = clientIp(req);

  // 1. Require API key header
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    await logCall({ userId: null, endpoint, method, statusCode: 401, status: 'failed', ip, summary: 'Missing X-API-Key header' });
    return res.status(401).json({ success: false, message: 'Missing X-API-Key header.' });
  }

  // 2. Validate required body fields
  const { voice_url, tts_text, emotion = 'neutral' } = req.body;
  if (!voice_url || !tts_text) {
    await logCall({ userId: null, endpoint, method, statusCode: 400, status: 'failed', ip, summary: 'Missing voice_url or tts_text' });
    return res.status(400).json({ success: false, message: 'voice_url and tts_text are required.' });
  }

  try {
    // 3. Validate API key
    const [keyRows] = await db.query(
      'SELECT user_id FROM user_api_keys WHERE api_key = ?',
      [apiKey]
    );
    if (!keyRows.length) {
      await logCall({ userId: null, endpoint, method, statusCode: 401, status: 'failed', ip, summary: 'Invalid API key' });
      return res.status(401).json({ success: false, message: 'Invalid or revoked API key.' });
    }

    const userId = keyRows[0].user_id;

    // 4. Stamp last_used_at
    await db.query('UPDATE user_api_keys SET last_used_at = NOW() WHERE api_key = ?', [apiKey]);

    // 5. Fetch user data for credit validation
    const [[user]] = await db.query(
      'SELECT base_plan, addons, agency_owner_id, credits_balance FROM users WHERE id = ?',
      [userId]
    );
    const plan     = (user?.base_plan || 'FE').toUpperCase();
    const addons   = user?.addons || {};
    const wordCount = tts_text.trim().split(/\s+/).filter(Boolean).length;

    // 6. Determine if user has unlimited credits
    const isUnlimited = plan === 'BUNDLE' || plan === 'ALLACCESS' || plan === 'UNLIMITED'
      || addons.UNLIMITED === true || addons.unlimited === true
      || addons.BUNDLE    === true || addons.bundle    === true
      || addons.ALLACCESS === true || addons.allaccess === true;

    // 7. Credit validation (skip for unlimited plans)
    if (!isUnlimited) {
      if (user?.agency_owner_id) {
        // Agency sub-user: validate against their allocated balance
        const remaining = parseInt(user.credits_balance) || 0;
        if (wordCount > remaining) {
          await logCall({ userId, endpoint, method, statusCode: 400, status: 'failed', ip, summary: `Insufficient credits: need ${wordCount}, have ${remaining}` });
          return res.status(400).json({
            success:           false,
            message:           `Insufficient credits. This script needs ${wordCount} credits but you only have ${remaining} remaining.`,
            credits_required:  wordCount,
            credits_available: remaining,
          });
        }
      } else {
        // Regular plan user: check monthly usage against plan limit
        const monthYear = new Date().toISOString().slice(0, 7);
        const [[usage]]  = await db.query(
          'SELECT credits_used FROM user_usage_monthly WHERE user_id = ? AND month_year = ?',
          [userId, monthYear]
        );
        const [[limits]] = await db.query(
          'SELECT credits FROM plan_limits WHERE plan_id = ?',
          [plan]
        );
        const creditsUsed  = parseInt(usage?.credits_used)  || 0;
        const creditsLimit = parseInt(limits?.credits)       || 1000;
        if (creditsUsed + wordCount > creditsLimit) {
          const remaining = Math.max(0, creditsLimit - creditsUsed);
          await logCall({ userId, endpoint, method, statusCode: 400, status: 'failed', ip, summary: `Monthly credits exceeded: used ${creditsUsed}/${creditsLimit}, need ${wordCount}` });
          return res.status(400).json({
            success:           false,
            message:           `Monthly credit limit reached. This script needs ${wordCount} credits but you only have ${remaining} remaining this month.`,
            credits_required:  wordCount,
            credits_available: remaining,
          });
        }
      }
    }

    // 8. Check TTS server load before calling
    const serverFree = await isTtsServerFree();
    if (!serverFree) {
      await logCall({ userId, endpoint, method, statusCode: 503, status: 'failed', ip, summary: 'TTS server busy or unreachable' });
      return res.status(503).json({
        success: false,
        message: 'The voice generation service is currently experiencing high demand. Please try again in a few moments.',
      });
    }

    // 9. Call external TTS API
    const ttsPayload = {
      api_key:   process.env.TTS_API_KEY,
      mode:      'voiceover',
      prompt:    'voiceover',
      audio_url: voice_url,
      tts_text,
      emotion,
    };

    console.log('[publicAPI] Calling external TTS API for user', userId);
    const ttsResponse = await axios.post(TTS_API_URL, ttsPayload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 120_000,
    });

    const result = ttsResponse.data;
    console.log('[publicAPI] TTS API response for user', userId, result);
    const outputUrl = result?.data?.output_url || result?.output_url;
    if (!outputUrl) {
      const errMsg = result?.message || result?.data?.message || 'TTS API did not return an output_url';
      await logCall({ userId, endpoint, method, statusCode: 422, status: 'failed', ip, summary: errMsg });
      return res.status(422).json({ success: false, message: errMsg });
    }

    // 9. Download the generated audio and save locally
    const uploadDir = path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext      = outputUrl.endsWith('.wav') ? 'wav' : 'mp3';
    const filename = `api_voice_${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    const audioResponse = await axios.get(outputUrl, {
      responseType: 'arraybuffer',
      timeout: 60_000,
    });
    fs.writeFileSync(filePath, Buffer.from(audioResponse.data));

    const baseUrl  = process.env.BASE_URL || 'http://localhost:5000';
    const localUrl = `${baseUrl}/uploads/${filename}`;

    // 10. Deduct credits after successful generation
    if (!isUnlimited) {
      const monthYear = new Date().toISOString().slice(0, 7);
      const nowIso    = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await db.query(
        `INSERT INTO user_usage_monthly (user_id, month_year, credits_used, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE credits_used = credits_used + ?, updated_at = NOW()`,
        [userId, monthYear, wordCount, nowIso, nowIso, wordCount]
      );
      // Agency sub-users: also decrement credits_balance
      if (user?.agency_owner_id) {
        await db.query(
          'UPDATE users SET credits_balance = GREATEST(0, credits_balance - ?), updated_at = NOW() WHERE id = ?',
          [wordCount, userId]
        );
      }
    }

    await logCall({
      userId,
      endpoint,
      method,
      statusCode: 200,
      status:     'success',
      ip,
      summary:    `Voice generated — ${filename} (${wordCount} credits)`,
    });

    return res.json({
      success:      true,
      audio_url:    localUrl,
      filename,
      credits_used: isUnlimited ? 0 : wordCount,
    });

  } catch (error) {
    console.error('generateVoice error:', error.message);
    const apiMsg = error.response?.data?.message || error.response?.data?.error;
    await logCall({ userId: null, endpoint, method, statusCode: 500, status: 'failed', ip, summary: apiMsg || error.message });
    return res.status(500).json({ success: false, message: apiMsg || 'Voice generation failed. Please try again.' });
  }
};

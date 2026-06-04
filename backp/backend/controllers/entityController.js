import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { buildOrderBy, buildWhere } from '../utils/query.js';
import { pushNotification } from './notificationController.js';

// Notification config per table — fires once on successful CREATE
const NOTIF_MAP = {
  voiceovers:             (r) => ({ icon: '🎤', title: 'Voiceover Queued',        message: `"${r.title || 'Untitled'}" has been queued for generation.`,          type: 'voiceover'     }),
  voice_clones:           (r) => ({ icon: '🐑', title: 'Voice Clone Submitted',   message: `"${r.name  || 'Untitled'}" is being cloned and will be ready shortly.`, type: 'clone'         }),
  custom_voices:          (r) => ({ icon: '✨', title: 'Custom Voice Created',     message: `"${r.name  || 'Untitled'}" is being processed.`,                       type: 'custom_voice'  }),
  audio_mixes:            (r) => ({ icon: '🎛️', title: 'Audio Mix Queued',         message: `"${r.name  || 'Untitled'}" has been queued for mixing.`,               type: 'audio_mix'     }),
  transcriptions:         (r) => ({ icon: '🎥', title: 'Transcription Queued',    message: `"${r.title || 'Untitled'}" has been submitted for transcription.`,      type: 'transcription' }),
  conversational_voices:  (r) => ({ icon: '👥', title: 'Conversation Queued',     message: `"${r.title || 'Untitled'}" has been submitted for generation.`,         type: 'conversational'}),
  brand_studio_projects:  (r) => ({ icon: '🎨', title: 'Brand Project Created',   message: `"${r.title || 'Untitled'}" has been created and is ready to edit.`,     type: 'brand_studio'  }),
  audiobooks:             (r) => ({ icon: '📖', title: 'Audiobook Queued',         message: `"${r.title || 'Untitled'}" has been queued for audio generation.`,       type: 'audiobook'     }),
  vsl_copies:             (r) => ({ icon: '📋', title: 'VSL Script Generated',    message: `VSL script for "${r.product_name || 'your product'}" is ready.`,        type: 'vsl'           }),
  ad_copies:              (r) => ({ icon: '📝', title: 'Ad Copy Generated',       message: `Ad copy for "${r.product_name || 'your product'}" is ready.`,           type: 'adcopy'        }),
};

/**
 * Creates a standard CRUD controller for a table.
 * @param {string} tableName  - MySQL table name
 * @param {string[]} fields   - Allowed insert/update fields (whitelist)
 * @param {boolean} userScoped - If true, records are scoped to req.user.id via user_id
 */
export function createEntityController(tableName, fields, userScoped = true) {

  const list = async (req, res) => {
    try {
      const { sort = '-created_at', limit, offset = 0, ...filters } = req.query;
      const order = buildOrderBy(sort);

      const conditions = userScoped ? ['user_id = ?'] : [];
      const values = userScoped ? [req.user.id] : [];

      for (const [key, val] of Object.entries(filters)) {
        if (val !== undefined && val !== null && val !== '') {
          conditions.push(`${key} = ?`);
          values.push(val);
        }
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const limitClause = limit ? `LIMIT ${parseInt(limit)}` : '';
      const offsetClause = offset ? `OFFSET ${parseInt(offset)}` : '';

      const [rows] = await db.query(
        `SELECT * FROM ${tableName} ${whereClause} ORDER BY ${order} ${limitClause} ${offsetClause}`,
        values
      );

      // Parse JSON fields
      const parsed = rows.map(row => parseJsonFields(row));
      return successResponse(res, parsed);
    } catch (error) {
      console.error(`List ${tableName} error:`, error);
      return errorResponse(res, `Failed to list ${tableName}`, 500);
    }
  };

  const getOne = async (req, res) => {
    try {
      const conditions = ['id = ?'];
      const values = [req.params.id];
      if (userScoped) { conditions.push('user_id = ?'); values.push(req.user.id); }

      const [rows] = await db.query(
        `SELECT * FROM ${tableName} WHERE ${conditions.join(' AND ')}`,
        values
      );
      if (!rows.length) return errorResponse(res, 'Record not found', 404);
      return successResponse(res, parseJsonFields(rows[0]));
    } catch (error) {
      return errorResponse(res, `Failed to get ${tableName}`, 500);
    }
  };

  const create = async (req, res) => {
    try {
      const payload = sanitize(req.body, fields);
      if (userScoped) payload.user_id = req.user.id;

      // Serialize JSON fields
      serializeJsonFields(payload);

      const cols = Object.keys(payload).join(', ');
      const placeholders = Object.keys(payload).map(() => '?').join(', ');
      const vals = Object.values(payload);

      const [result] = await db.query(
        `INSERT INTO ${tableName} (${cols}, created_at, updated_at) VALUES (${placeholders}, NOW(), NOW())`,
        vals
      );

      const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
      const newRow = parseJsonFields(rows[0]);

      // Fire notification asynchronously — never blocks the response
      if (userScoped && NOTIF_MAP[tableName]) {
        const notif = NOTIF_MAP[tableName](newRow);
        pushNotification(req.user.id, { ...notif, entityId: newRow.id, entityType: tableName });
      }

      return successResponse(res, newRow, 'Created successfully', 201);
    } catch (error) {
      console.error(`Create ${tableName} error:`, error);
      return errorResponse(res, `Failed to create ${tableName}`, 500);
    }
  };

  const update = async (req, res) => {
    try {
      const payload = sanitize(req.body, fields);
      serializeJsonFields(payload);

      const conditions = ['id = ?'];
      const values = [];

      const setParts = Object.entries(payload).map(([k, v]) => { values.push(v); return `${k} = ?`; });
      values.push(req.params.id);
      if (userScoped) { conditions.push('user_id = ?'); values.push(req.user.id); }

      await db.query(
        `UPDATE ${tableName} SET ${setParts.join(', ')}, updated_at = NOW() WHERE ${conditions.join(' AND ')}`,
        values
      );

      const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [req.params.id]);
      if (!rows.length) return errorResponse(res, 'Record not found', 404);
      const updatedRow = parseJsonFields(rows[0]);
      return successResponse(res, updatedRow, 'Updated successfully');
    } catch (error) {
      console.error(`Update ${tableName} error:`, error);
      return errorResponse(res, `Failed to update ${tableName}`, 500);
    }
  };

  const remove = async (req, res) => {
    try {
      const conditions = ['id = ?'];
      const values = [req.params.id];
      if (userScoped) { conditions.push('user_id = ?'); values.push(req.user.id); }

      const [result] = await db.query(
        `DELETE FROM ${tableName} WHERE ${conditions.join(' AND ')}`,
        values
      );
      if (result.affectedRows === 0) return errorResponse(res, 'Record not found', 404);
      return successResponse(res, null, 'Deleted successfully');
    } catch (error) {
      return errorResponse(res, `Failed to delete ${tableName}`, 500);
    }
  };

  return { list, getOne, create, update, remove };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sanitize(body, allowedFields) {
  const result = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      result[field] = body[field];
    }
  }
  return result;
}

const JSON_FIELDS = ['addons', 'tags', 'variations', 'metadata', 'voiceover_ids', 'billing_product_ids', 'speakers', 'segments', 'brand_voice_profile', 'additional_scripts'];

function serializeJsonFields(obj) {
  for (const field of JSON_FIELDS) {
    if (obj[field] !== undefined && typeof obj[field] !== 'string') {
      obj[field] = JSON.stringify(obj[field]);
    }
  }
}

function parseJsonFields(obj) {
  if (!obj) return obj;
  const clone = { ...obj };
  for (const field of JSON_FIELDS) {
    if (typeof clone[field] === 'string') {
      try { clone[field] = JSON.parse(clone[field]); } catch {}
    }
  }
  return clone;
}

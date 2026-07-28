import { z } from 'zod';
import { db } from '../../config/database.js';

const JSON_FIELDS = ['addons', 'tags', 'variations', 'metadata', 'voiceover_ids', 'billing_product_ids', 'speakers', 'segments', 'brand_voice_profile', 'additional_scripts'];

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

function serializeJsonFields(obj) {
  for (const field of JSON_FIELDS) {
    if (obj[field] !== undefined && typeof obj[field] !== 'string') {
      obj[field] = JSON.stringify(obj[field]);
    }
  }
}

function sanitize(body, allowedFields) {
  const result = {};
  for (const f of allowedFields) {
    if (body[f] !== undefined) result[f] = body[f];
  }
  return result;
}

export function registerEntityTools(server, { getUserCtx }, config) {
  const { toolPrefix, tableName, entityName, fields, description } = config;

  // CREATE
  server.tool(
    `create_${toolPrefix}`,
    `Create a new ${entityName}. ${description}`,
    config.createSchema,
    async (params, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      try {
        const payload = sanitize(params, fields);
        payload.user_id = userId;
        serializeJsonFields(payload);

        const cols = Object.keys(payload).join(', ');
        const placeholders = Object.keys(payload).map(() => '?').join(', ');
        const vals = Object.values(payload);

        const [result] = await db.query(
          `INSERT INTO ${tableName} (${cols}, created_at, updated_at) VALUES (${placeholders}, NOW(), NOW())`,
          vals
        );
        const [rows] = await db.query(`SELECT * FROM ${tableName} WHERE id = ?`, [result.insertId]);
        return { content: [{ type: 'text', text: JSON.stringify(parseJsonFields(rows[0]), null, 2) }] };
      } catch (err) {
        return { content: [{ type: 'text', text: `Error creating ${entityName}: ${err.message}` }], isError: true };
      }
    }
  );

  // GET by ID
  server.tool(
    `get_${toolPrefix}`,
    `Get a ${entityName} by ID. Returns status, data, and output URLs.`,
    { id: z.number().describe(`The ${entityName} ID`) },
    async ({ id }, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      const [rows] = await db.query(
        `SELECT * FROM ${tableName} WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      if (!rows.length) return { content: [{ type: 'text', text: `${entityName} not found.` }], isError: true };
      return { content: [{ type: 'text', text: JSON.stringify(parseJsonFields(rows[0]), null, 2) }] };
    }
  );

  // LIST
  server.tool(
    `list_${toolPrefix}s`,
    `List all ${entityName}s for the authenticated user.`,
    {
      limit: z.number().optional().default(20).describe('Max results to return'),
      status: z.string().optional().describe('Filter by status (e.g. completed, processing, draft)'),
    },
    async ({ limit, status }, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      let query = `SELECT * FROM ${tableName} WHERE user_id = ?`;
      const values = [userId];
      if (status) { query += ' AND status = ?'; values.push(status); }
      query += ' ORDER BY created_at DESC';
      if (limit) { query += ` LIMIT ${parseInt(limit)}`; }

      const [rows] = await db.query(query, values);
      const parsed = rows.map(r => parseJsonFields(r));
      return { content: [{ type: 'text', text: JSON.stringify({ count: parsed.length, data: parsed }, null, 2) }] };
    }
  );

  // DELETE
  server.tool(
    `delete_${toolPrefix}`,
    `Delete a ${entityName} by ID.`,
    { id: z.number().describe(`The ${entityName} ID to delete`) },
    async ({ id }, extra) => {
      const { userId } = await getUserCtx(extra);
      if (!userId) return { content: [{ type: 'text', text: 'Error: Invalid API key.' }], isError: true };

      const [result] = await db.query(
        `DELETE FROM ${tableName} WHERE id = ? AND user_id = ?`,
        [id, userId]
      );
      if (result.affectedRows === 0) return { content: [{ type: 'text', text: `${entityName} not found.` }], isError: true };
      return { content: [{ type: 'text', text: `${entityName} deleted successfully.` }] };
    }
  );
}

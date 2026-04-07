import { Router } from 'express';
import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

/** GET /api/system-voices — all authenticated users */
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM system_voices WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`
    );
    return successResponse(res, rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch system voices', 500);
  }
});

/** GET /api/system-voices/all — admin: includes inactive */
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM system_voices ORDER BY sort_order ASC, id ASC`);
    return successResponse(res, rows);
  } catch (err) {
    return errorResponse(res, 'Failed to fetch system voices', 500);
  }
});

/** POST /api/system-voices — admin only */
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, type, description, audio_url, is_active = 1, sort_order = 0 } = req.body;
    if (!name || !type) return errorResponse(res, 'name and type are required', 400);
    const [result] = await db.query(
      `INSERT INTO system_voices (name, type, description, audio_url, is_active, sort_order, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, type, description || null, audio_url || null, is_active ? 1 : 0, sort_order]
    );
    const [rows] = await db.query(`SELECT * FROM system_voices WHERE id = ?`, [result.insertId]);
    return successResponse(res, rows[0], 'Voice created', 201);
  } catch (err) {
    return errorResponse(res, 'Failed to create system voice', 500);
  }
});

/** PUT /api/system-voices/:id — admin only */
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, type, description, audio_url, is_active, sort_order } = req.body;
    const fields = [];
    const values = [];
    if (name        !== undefined) { fields.push('name = ?');        values.push(name); }
    if (type        !== undefined) { fields.push('type = ?');        values.push(type); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (audio_url   !== undefined) { fields.push('audio_url = ?');   values.push(audio_url); }
    if (is_active   !== undefined) { fields.push('is_active = ?');   values.push(is_active ? 1 : 0); }
    if (sort_order  !== undefined) { fields.push('sort_order = ?');  values.push(sort_order); }
    if (!fields.length) return errorResponse(res, 'Nothing to update', 400);
    values.push(req.params.id);
    await db.query(`UPDATE system_voices SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`, values);
    const [rows] = await db.query(`SELECT * FROM system_voices WHERE id = ?`, [req.params.id]);
    if (!rows.length) return errorResponse(res, 'Voice not found', 404);
    return successResponse(res, rows[0], 'Updated');
  } catch (err) {
    return errorResponse(res, 'Failed to update system voice', 500);
  }
});

/** DELETE /api/system-voices/:id — admin only */
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query(`DELETE FROM system_voices WHERE id = ?`, [req.params.id]);
    if (result.affectedRows === 0) return errorResponse(res, 'Voice not found', 404);
    return successResponse(res, null, 'Deleted');
  } catch (err) {
    return errorResponse(res, 'Failed to delete system voice', 500);
  }
});

export default router;

import { Router } from 'express';
import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createEntityController } from '../controllers/entityController.js';

const router = Router();

const FIELDS = [
  'name', 'description', 'language', 'gender', 'clone_mode',
  'is_public', 'sample_url', 'audio_url', 'source_type', 'status',
  'quality_score', 'is_favorite',
];

const ctrl = createEntityController('voice_clones', FIELDS, true);

/**
 * GET /api/voice-clones/public
 * Returns all ready voice clones where is_public = 1, regardless of owner.
 * Must be registered BEFORE /:id so "public" is not interpreted as an ID.
 */
router.get('/public', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM voice_clones WHERE is_public = 1 AND status = 'ready' ORDER BY created_at DESC`
    );
    return successResponse(res, rows);
  } catch (error) {
    console.error('Public voice clones error:', error);
    return errorResponse(res, 'Failed to fetch public voice clones', 500);
  }
});

// Standard CRUD — order matters: /public must come before /:id
router.get('/',     ctrl.list);
router.get('/:id',  ctrl.getOne);
router.post('/',    ctrl.create);
router.put('/:id',  ctrl.update);
router.delete('/:id', ctrl.remove);

export default router;

import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import { createEntityController } from '../controllers/entityController.js';

const router = Router();
const ctrl = createEntityController(
  'background_music_tracks',
  ['name', 'category', 'mood', 'duration', 'audio_url', 'is_active'],
  false  // not user-scoped — shared library
);

// All authenticated users can list / read
router.get('/',    verifyToken, ctrl.list);
router.get('/:id', verifyToken, ctrl.getOne);

// Only admins can create / update / delete
router.post('/',    verifyToken, requireAdmin, ctrl.create);
router.put('/:id',  verifyToken, requireAdmin, ctrl.update);
router.delete('/:id', verifyToken, requireAdmin, ctrl.remove);

export default router;

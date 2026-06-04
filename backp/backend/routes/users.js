import { Router } from 'express';
import { getMe, updateMe, listUsers } from '../controllers/usersController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET  /api/users/me
router.get('/me', getMe);

// PUT  /api/users/me
router.put('/me', updateMe);

// GET  /api/users  (admin only - for Agency page)
router.get('/', requireAdmin, listUsers);

export default router;

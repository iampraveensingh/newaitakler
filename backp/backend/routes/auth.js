import { Router } from 'express';
import { login, checkAuth, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/check  (protected)
router.get('/check', verifyToken, checkAuth);

// POST /api/auth/logout  (protected)
router.post('/logout', verifyToken, logout);

export default router;

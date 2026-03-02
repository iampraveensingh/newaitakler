import { Router } from 'express';
import { generateContent } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/ai/generate
router.post('/generate', verifyToken, generateContent);

export default router;

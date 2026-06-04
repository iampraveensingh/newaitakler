import { Router } from 'express';
import { generateContent, analyzeBrand } from '../controllers/aiController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/ai/generate
router.post('/generate', verifyToken, generateContent);

// POST /api/ai/brand-analyze  — scrape URL + DeepSeek brand analysis
router.post('/brand-analyze', verifyToken, analyzeBrand);

export default router;

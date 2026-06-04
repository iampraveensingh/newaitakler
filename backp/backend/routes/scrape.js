import { Router } from 'express';
import { scrapeUrl } from '../controllers/scrapeController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// POST /api/scrape
router.post('/', verifyToken, scrapeUrl);

export default router;

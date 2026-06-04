import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { searchJobs } from '../controllers/jobsController.js';

const router = express.Router();

// GET /api/jobs/search?q=<keyword>
router.get('/search', verifyToken, searchJobs);

export default router;

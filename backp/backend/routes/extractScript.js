import express from 'express';
import { extractScript } from '../controllers/extractScriptController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, extractScript);

export default router;

import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getApiKey, generateApiKey, revokeApiKey, getApiLogs } from '../controllers/apiKeyController.js';

const router = express.Router();

// All routes require a valid JWT
router.use(verifyToken);

router.get('/',          getApiKey);      // GET  /api/api-keys
router.post('/generate', generateApiKey); // POST /api/api-keys/generate
router.delete('/',       revokeApiKey);   // DELETE /api/api-keys
router.get('/logs',      getApiLogs);     // GET  /api/api-keys/logs

export default router;

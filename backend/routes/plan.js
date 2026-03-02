import { Router } from 'express';
import { getPlanLimits, getUsageMonthly, trackUsage, getDfyOffers } from '../controllers/planController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// GET /api/plan-limits?plan_id=FE
router.get('/', getPlanLimits);

export default router;

export const usageRouter = Router();
usageRouter.use(verifyToken);
// GET  /api/usage-monthly?user_id=1&month_year=2025-01
usageRouter.get('/', getUsageMonthly);
// POST /api/usage-monthly/track  { feature: 'credits'|'clones'|'vsl'|'ad'|'custom'|'transcriptions', amount: 1 }
usageRouter.post('/track', trackUsage);

export const dfyOffersRouter = Router();
dfyOffersRouter.use(verifyToken);
// GET /api/dfy-offers
dfyOffersRouter.get('/', getDfyOffers);

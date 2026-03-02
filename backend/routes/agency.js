import { Router } from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import {
  requireAgencyAddon,
  listAgencyUsers,
  createAgencyUser,
  updateAgencyUser,
  removeAgencyUser,
  allocateCredits,
  getAgencyStats,
} from '../controllers/agencyController.js';

const router = Router();

// All agency routes require authentication + admin role + AGENCY addon
router.use(verifyToken);
router.use(requireAdmin);
router.use(requireAgencyAddon);

// GET  /api/agency/users         — list all sub-users for this admin
router.get('/users', listAgencyUsers);

// POST /api/agency/users         — create a new agency sub-user
router.post('/users', createAgencyUser);

// PUT  /api/agency/users/:id     — update sub-user details
router.put('/users/:id', updateAgencyUser);

// DELETE /api/agency/users/:id   — deactivate a sub-user
router.delete('/users/:id', removeAgencyUser);

// POST /api/agency/users/:id/credits — set credit balance for a sub-user
router.post('/users/:id/credits', allocateCredits);

// GET  /api/agency/stats         — stats for the agency dashboard
router.get('/stats', getAgencyStats);

export default router;

import { Router } from 'express';
import {
  getNotifications,
  markAllRead,
  markRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = Router();

router.get('/',              getNotifications);
router.put('/read-all',      markAllRead);
router.put('/:id/read',      markRead);
router.delete('/:id',        deleteNotification);

export default router;

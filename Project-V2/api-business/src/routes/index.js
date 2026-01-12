import { Router } from 'express';
import authRoutes from './authRoutes.js';
import activityRoutes from './activityRoutes.js';
import studentRoutes from './studentRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/students', studentRoutes);
router.use('/reports', reportRoutes);

export default router;
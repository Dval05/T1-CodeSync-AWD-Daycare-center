import { Router } from 'express';
import authRoutes from './authRoutes.js';
import activityRoutes from './activityRoutes.js';
import studentRoutes from './studentRoutes.js';
import reportRoutes from './reportRoutes.js';
import financeRoutes from './financeRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import guardianRoutes from './guardianRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/activities', activityRoutes);
router.use('/students', studentRoutes);
router.use('/reports', reportRoutes);
router.use('/finance', financeRoutes);
router.use('/employees', employeeRoutes);
router.use('/guardians', guardianRoutes);
router.use('/notifications', notificationRoutes);

export default router;
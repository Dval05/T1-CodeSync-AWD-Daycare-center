import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { 
    getSchedules, 
    assignTask, 
    getEmployeeTasks, 
    updateTaskStatus 
} from '../controllers/employeeController.js';

const router = Router();

router.get('/schedules', requireAuth, requirePermission('Personal', 'view'), getSchedules);

router.post('/tasks/assign', requireAuth, requirePermission('Personal', 'edit'), assignTask);

router.get('/:id/tasks', requireAuth, requirePermission('Personal', 'view'), getEmployeeTasks);

router.put('/tasks/:taskId', requireAuth, requirePermission('Personal', 'edit'), updateTaskStatus);

export default router;

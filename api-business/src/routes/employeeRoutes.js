import { Router } from 'express';
import { requireAuth, requirePermission } from '../middleware/authMiddleware.js';
import { 
    getSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    assignShiftDays,
    getCalendarView,
    exportSchedulesCsv,
    assignTask,
    getEmployeeTasks,
    updateTaskStatus
} from '../controllers/employeeController.js';

const router = Router();

router.get('/schedules', requireAuth, requirePermission('Personal', 'view'), getSchedules);
router.post('/schedules', requireAuth, requirePermission('Personal', 'edit'), createSchedule);
router.put('/schedules/:id', requireAuth, requirePermission('Personal', 'edit'), updateSchedule);
router.delete('/schedules/:id', requireAuth, requirePermission('Personal', 'edit'), deleteSchedule);
router.post('/schedules/assign', requireAuth, requirePermission('Personal', 'edit'), assignShiftDays);
router.get('/schedules/calendar', requireAuth, requirePermission('Personal', 'view'), getCalendarView);
router.get('/schedules/export', requireAuth, requirePermission('Personal', 'view'), exportSchedulesCsv);

router.post('/tasks/assign', requireAuth, requirePermission('Personal', 'edit'), assignTask);

router.get('/:id/tasks', requireAuth, requirePermission('Personal', 'view'), getEmployeeTasks);

router.put('/tasks/:taskId', requireAuth, requirePermission('Personal', 'edit'), updateTaskStatus);

export default router;

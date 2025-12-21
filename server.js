import express from 'express';
import cors from 'cors';
import studentsRouter from './routes/students.js';
import studentGuardianRouter from './routes/studentGuardian.js'; 
import guardiansRouter from './routes/guardians.js';
import staffRouter from './routes/staff.js';
import accessRoutes from './routes/accessRoutes.js';
import gradesRouter from './routes/grades.js';
import activitiesRouter from './routes/activities.js';
import activitiesMediaRouter from './routes/activityMedia.js';
import usersRouter from './routes/users.js';
import userRolesRouter from './routes/userRoles.js';
import attendanceRouter from './routes/attendance.js';
import studentPaymentRouter from './routes/studentPayment.js';
import teacherPaymentRouter from './routes/teacherPayment.js';
import sessionRoutes from './routes/sessionRoutes.js';
import employeeTaskRoutes from './routes/employeeTaskRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import studentObservationRoutes from './routes/studentObservationRoutes.js';
import { requireAuth } from './middleware/requireAuth.js';

const app = express();
// Use a dedicated API_PORT to avoid clashing with Apache's PORT
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
// Protect all /api routes with auth (Supabase or Google)
app.use('/api', requireAuth);
// Alias under /api for consistency with frontend calls (protected)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), user: req.user });
});

// Mount module routes
app.use('/api/students', studentsRouter);
app.use('/api/student-guardians', studentGuardianRouter);
app.use('/api/guardians', guardiansRouter);
app.use('/api/staff', staffRouter);
app.use('/api/access', accessRoutes);
app.use('/api/grades', gradesRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/activity-media', activitiesMediaRouter);
app.use('/api/users', usersRouter);
app.use('/api/user-roles', userRolesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/student-payments', studentPaymentRouter);
app.use('/api/teacher-payments', teacherPaymentRouter);
app.use('/api/sessions', sessionRoutes);
app.use('/api/employee-tasks', employeeTaskRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/student-observations', studentObservationRoutes);

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import ChangePasswordModal from './components/auth/ChangePasswordModal';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Audit from './pages/Audit';
import ActivityManager from './pages/ActivityManager';
import Intake from './pages/Intake';
import Students from './pages/Students';
import Grades from './pages/Grades';
import Guardians from './pages/Guardians';
import Payments from './pages/Payments';
import EmployeePayments from './pages/EmployeePayments';
import Profile from './pages/Profile';
import Staff from './pages/Staff';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Invoices from './pages/Invoices'
import Attendance from './pages/Attendance';
import Roles from './pages/Roles';
import Notifications from './pages/Notifications';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
    const auth = useAuth() || {};
    const { user, loading, sessionExpired } = auth;
    
    if (loading) return <div>Cargando...</div>;
    
    if (sessionExpired || !user) {
        return <Navigate to="/" replace />;
    }
    
    return children;
};

const AppContent = () => {
    const auth = useAuth() || {};
    const { mustChangePassword, profile, onPasswordChanged, user, logoutDueToInactivity } = auth;
    const navigate = useNavigate();

    useInactivityTimeout(5 * 60 * 1000, () => {
        if (user) {
            toast.error('Tu sesión ha expirado por inactividad', {
                duration: 4000,
                position: 'top-center'
            });
            logoutDueToInactivity();
            navigate('/', { replace: true });
        }
    });

    return (
        <>
            <Routes>
                <Route path="/" element={<Login />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />
                <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
                <Route path="/intake" element={<ProtectedRoute><Intake /></ProtectedRoute>} />
                <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
                <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/employee-payments" element={<ProtectedRoute><EmployeePayments /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
                <Route path="/activity-manager" element={<ProtectedRoute><ActivityManager /></ProtectedRoute>} />
                <Route path="/guardians" element={<ProtectedRoute><Guardians /></ProtectedRoute>} />
                <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            </Routes>

            {mustChangePassword && profile && (
                <ChangePasswordModal 
                    user={profile} 
                    onSuccess={onPasswordChanged}
                />
            )}
        </>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </AuthProvider>
    );
}
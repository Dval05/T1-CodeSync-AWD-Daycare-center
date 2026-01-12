import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import ActivityManager from './pages/ActivityManager';
import Intake from './pages/Intake';
import Students from './pages/Students';
import Grades from './pages/Grades';
import Guardians from './pages/Guardians';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Staff from './pages/Staff';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Invoices from './pages/Invoices'
import Attendance from './pages/Attendance';
import Roles from './pages/Roles';

// Importa el resto de tus páginas aquí...

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Cargando...</div>;
    if (!user) return <Navigate to="/" />;
    return children;
};

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    
                    {/* Rutas Protegidas */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
                    <Route path="/intake" element={<ProtectedRoute><Intake /></ProtectedRoute>} />
                    <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
                    <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
                    <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                    <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
                    <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
                    <Route path="/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
                    <Route path="/activity-manager" element={<ProtectedRoute><ActivityManager /></ProtectedRoute>} />
                    <Route path="/guardians" element={<ProtectedRoute><Guardians /></ProtectedRoute>} />
                    <Route path="/staff" element={<ProtectedRoute><Staff /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    {/* Agrega aquí Students, Grades, etc. */}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
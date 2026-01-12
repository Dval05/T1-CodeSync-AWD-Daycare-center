import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, Users, GraduationCap, CalendarDays, 
    FileText, UserCheck, DollarSign, Bolt, Shield, X 
} from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const location = useLocation();

    // Menú de navegación
    const menu = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Actividades', path: '/activities', icon: CalendarDays },
        { label: 'Estudiantes', path: '/students', icon: GraduationCap },
        { label: 'Alta Rápida', path: '/intake', icon: Bolt },
        { label: 'Asistencia', path: '/attendance', icon: UserCheck },
        { label: 'Pagos', path: '/payments', icon: DollarSign },
        { label: 'Usuarios', path: '/users', icon: Users },
        { label: 'Roles y Permisos', path: '/roles', icon: Shield },
        { label: 'Facturas', path: '/invoices', icon: FileText },
        { label: 'Responsables', path: '/guardians', icon: Users },
        { label: 'Personal', path: '/staff', icon: Users },
        { label: 'Tareas', path: '/tasks', icon: FileText },
        { label: 'Gestor de Actividades', path: '/activity-manager', icon: CalendarDays }
    ];

    return (
        <>
            {/* FONDO OSCURO (Solo en Móvil cuando está abierto) */}
            <div 
                onClick={() => setSidebarOpen(false)}
                className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${
                    sidebarOpen ? 'block' : 'hidden'
                }`}
            ></div>

            {/* SIDEBAR */}
            <aside 
                className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition-transform duration-300 transform bg-slate-900 lg:translate-x-0 lg:static lg:inset-0 ${
                    sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
                }`}
            >
                {/* Cabecera del Sidebar */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-blue-400">NiceKids</h1>
                    <button 
                        onClick={() => setSidebarOpen(false)} 
                        className="text-slate-400 lg:hidden hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Lista de Enlaces */}
                <nav className="p-4 space-y-2">
                    {menu.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)} // Cerrar al hacer clic en móvil
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
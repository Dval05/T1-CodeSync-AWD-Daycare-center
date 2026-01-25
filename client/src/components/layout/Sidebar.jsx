import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { MENU_CONFIG } from '../../config/menuConfig';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const location = useLocation();
    const { hasAnyPermission, loading } = usePermissions();

    // Filtrar menú según permisos del usuario
    const visibleMenu = MENU_CONFIG.filter(item => {
        // Si no requiere permisos, siempre visible
        if (!item.permissions || item.permissions.length === 0) {
            return true;
        }
        // Mostrar si tiene al menos uno de los permisos requeridos
        return hasAnyPermission(item.permissions);
    });

    if (loading) {
        return (
            <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 lg:static lg:inset-0">
                <div className="flex items-center justify-center h-full">
                    <div className="text-slate-400">Cargando menú...</div>
                </div>
            </aside>
        );
    }

    return (
        <>
            {}
            <div 
                onClick={() => setSidebarOpen(false)}
                className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${
                    sidebarOpen ? 'block' : 'hidden'
                }`}
            ></div>

            {}
            <aside 
                className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition-transform duration-300 transform bg-slate-900 lg:translate-x-0 lg:static lg:inset-0 ${
                    sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
                }`}
            >
                {}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-blue-400">NiceKids</h1>
                    <button 
                        onClick={() => setSidebarOpen(false)} 
                        className="text-slate-400 lg:hidden hover:text-white"
                    >
                        <X size={24} />
                    </button>
                </div>

                {}
                <nav className="p-4 space-y-2">
                    {visibleMenu.map((item) => {
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
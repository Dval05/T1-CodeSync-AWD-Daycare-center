import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User } from 'lucide-react';

export default function Header({ toggleSidebar }) {
    const { user, logout, profile } = useAuth();

    return (
        <header className="bg-white shadow-sm h-16 px-6 flex items-center justify-between sticky top-0 z-10">
            {/* Botón Menú (Solo visible en móvil) */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar} 
                    className="p-2 rounded-md hover:bg-gray-100 lg:hidden text-gray-600"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Perfil de Usuario */}
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-800">
                        {profile?.FirstName || 'Usuario'} {profile?.LastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                    <User size={20} />
                </div>

                <button 
                    onClick={logout} 
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                    title="Cerrar Sesión"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
}
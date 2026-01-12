import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; // Usamos el componente Header dedicado
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
    // Estado para controlar si el sidebar está abierto en móviles
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        // h-screen y overflow-hidden aseguran que la app ocupe el 100% sin scroll doble
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            
            {/* 1. SIDEBAR: Le pasamos el estado para que sepa abrirse/cerrarse en móvil */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* 2. ÁREA DE CONTENIDO */}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                
                {/* Header: Le pasamos la función para abrir el menú en móvil */}
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                {/* Main: Aquí se renderizan tus páginas (Dashboard, Users, etc.) */}
                <main className="w-full flex-grow p-6 animate-fade-in-up">
                    {children}
                </main>

            </div>

            {/* Notificaciones globales */}
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </div>
    );
}
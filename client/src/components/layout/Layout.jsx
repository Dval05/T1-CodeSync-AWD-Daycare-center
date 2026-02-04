import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header'; 
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            
            {}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {}
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                
                {}
                <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                {}
                <main className="w-full flex-grow p-6 animate-fade-in-up">
                    {children}
                </main>

            </div>

            {}
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </div>
    );
}
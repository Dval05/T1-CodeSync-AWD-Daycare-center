import React from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { MENU_CONFIG } from '../../config/menuConfig';
import { filterMenuByPermissions } from '../../utils/menuUtils';
import { SidebarOverlay } from './SidebarOverlay';
import { SidebarHeader } from './SidebarHeader';
import { MenuCategory } from './MenuCategory';
import { MenuItem } from './MenuItem';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { hasAnyPermission, loading } = usePermissions();

    const handleClose = () => setSidebarOpen(false);

    if (loading) {
        return (
            <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 lg:static lg:inset-0">
                <div className="flex items-center justify-center h-full">
                    <div className="text-slate-400">Cargando menú...</div>
                </div>
            </aside>
        );
    }

    const visibleMenu = filterMenuByPermissions(MENU_CONFIG, hasAnyPermission);

    return (
        <>
            <SidebarOverlay isOpen={sidebarOpen} onClose={handleClose} />

            <aside 
                className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition-transform duration-300 transform bg-slate-900 lg:translate-x-0 lg:static lg:inset-0 ${
                    sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'
                }`}
            >
                <SidebarHeader onClose={handleClose} />

                <nav className="p-4 space-y-2">
                    {visibleMenu.map((item) => {
                        if (item.children) {
                            return (
                                <MenuCategory
                                    key={item.id}
                                    category={item}
                                    visibleChildren={item.visibleChildren}
                                    onClose={handleClose}
                                />
                            );
                        }

                        return (
                            <MenuItem
                                key={item.id}
                                item={item}
                                onClose={handleClose}
                            />
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
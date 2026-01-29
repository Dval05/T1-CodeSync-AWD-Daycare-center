import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Settings, UserCircle } from 'lucide-react';
import NotificationBadge from '../notifications/NotificationBadge';
import NotificationPanel from '../notifications/NotificationPanel';
import { useNotifications } from '../../hooks/useNotifications';

export default function Header({ toggleSidebar }) {
    const { user, logout, profile } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationState = useNotifications();

    return (
        <header className="bg-white shadow-sm h-16 px-6 flex items-center justify-between sticky top-0 z-10">
            {}
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar} 
                    className="p-2 rounded-md hover:bg-gray-100 lg:hidden text-gray-600"
                >
                    <Menu size={24} />
                </button>
            </div>

            {}
            <div className="flex items-center gap-4">
                <NotificationBadge 
                    count={notificationState.unreadCount}
                    onClick={() => setShowNotifications(true)}
                />

                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-gray-800">
                        {profile?.FirstName || 'Usuario'} {profile?.LastName}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200 hover:border-blue-400 transition-all overflow-hidden"
                    >
                        {profile?.ProfilePhotoURL ? (
                            <img 
                                src={profile.ProfilePhotoURL} 
                                alt="Foto de perfil" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={20} />
                        )}
                    </button>

                    {showDropdown && (
                        <>
                            <div 
                                className="fixed inset-0 z-10" 
                                onClick={() => setShowDropdown(false)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                <button
                                    onClick={() => {
                                        navigate('/profile');
                                        setShowDropdown(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                    <UserCircle size={18} />
                                    <span>Mi Perfil</span>
                                </button>
                                <hr className="my-1" />
                                <button
                                    onClick={() => {
                                        logout();
                                        setShowDropdown(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={18} />
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <NotificationPanel 
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                notifications={notificationState.notifications}
                unreadCount={notificationState.unreadCount}
                loading={notificationState.loading}
                onMarkAsRead={notificationState.markAsRead}
                onMarkAllAsRead={notificationState.markAllAsRead}
                onDelete={notificationState.deleteNotification}
            />
        </header>
    );
}
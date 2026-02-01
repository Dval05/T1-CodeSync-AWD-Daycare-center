import React from 'react';
import { Bell } from 'lucide-react';

const NotificationBadge = ({ count, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            aria-label="Notificaciones"
        >
            <Bell size={24} />
            {count > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-pulse">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </button>
    );
};

export default NotificationBadge;

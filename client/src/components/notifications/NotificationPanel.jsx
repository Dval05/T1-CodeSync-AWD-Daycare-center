import React from 'react';
import { X, Check, CheckCheck, Trash2, AlertCircle, MessageSquare, Bell } from 'lucide-react';

const PRIORITY_COLORS = {
    Critical: 'bg-red-50 border-red-200 text-red-900',
    High: 'bg-orange-50 border-orange-200 text-orange-900',
    Normal: 'bg-blue-50 border-blue-200 text-blue-900',
    Low: 'bg-gray-50 border-gray-200 text-gray-900'
};

const TYPE_ICONS = {
    Alert: AlertCircle,
    Message: MessageSquare,
    Reminder: Bell
};

const NotificationPanel = ({
    isOpen,
    onClose,
    notifications,
    unreadCount,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    loading
}) => {
    if (!isOpen) return null;

    const formatRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins}m`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        return `Hace ${diffDays}d`;
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black bg-opacity-30 z-40"
                onClick={onClose}
            />
            <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
                <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold">Notificaciones</h2>
                            {unreadCount > 0 && (
                                <p className="text-xs text-blue-100">{unreadCount} sin leer</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-blue-500 p-2 rounded-full transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {unreadCount > 0 && (
                    <div className="p-3 bg-blue-50 border-b">
                        <button
                            onClick={onMarkAllAsRead}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 transition"
                        >
                            <CheckCheck size={18} />
                            Marcar todas como leídas
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Bell size={48} className="mb-4" />
                            <p>No hay notificaciones</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map(notification => {
                                const Icon = TYPE_ICONS[notification.Type] || MessageSquare;
                                const priorityColor = PRIORITY_COLORS[notification.Priority] || PRIORITY_COLORS.Normal;
                                
                                return (
                                    <div
                                        key={notification.NotificationID}
                                        className={`p-4 hover:bg-gray-50 transition ${
                                            notification.IsRead ? 'opacity-60' : 'bg-blue-50'
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${priorityColor}`}>
                                                <Icon size={20} />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        {notification.Subject && (
                                                            <h3 className="font-semibold text-sm text-gray-900 truncate">
                                                                {notification.Subject}
                                                            </h3>
                                                        )}
                                                        <p className="text-sm text-gray-700 mt-1 break-words">
                                                            {notification.Message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                            <span>{formatRelativeTime(notification.CreatedAt)}</span>
                                                            {notification.Priority !== 'Normal' && (
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor}`}>
                                                                    {notification.Priority}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex gap-1 ml-2">
                                                        {!notification.IsRead && (
                                                            <button
                                                                onClick={() => onMarkAsRead(notification.NotificationID)}
                                                                className="text-blue-600 hover:bg-blue-100 p-1.5 rounded transition"
                                                                title="Marcar como leída"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => onDelete(notification.NotificationID)}
                                                            className="text-red-600 hover:bg-red-100 p-1.5 rounded transition"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
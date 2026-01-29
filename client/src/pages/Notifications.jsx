import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { businessApi } from '../api/business';
import { crudApi } from '../api/crud';
import { useAuth } from '../context/AuthContext';
import { 
    Bell, Check, Trash2, Send, Users, User, Inbox, 
    Mail, MailOpen, AlertCircle, Clock, CreditCard, 
    Activity, ChevronLeft, CheckCheck, X
} from 'lucide-react';

const hasPermission = (permissions, module, action) => {
    return permissions?.includes(`${module}:${action}`);
};

const getPriorityColor = (priority) => {
    const colors = {
        'Low': 'bg-gray-100 text-gray-600',
        'Normal': 'bg-blue-100 text-blue-600',
        'High': 'bg-orange-100 text-orange-600',
        'Urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority] || colors['Normal'];
};

const getPriorityLabel = (priority) => {
    const labels = { 'Low': 'Baja', 'Normal': 'Normal', 'High': 'Alta', 'Urgent': 'Urgente' };
    return labels[priority] || priority;
};

const getTypeIcon = (type) => {
    const icons = {
        'Message': Mail,
        'Alert': AlertCircle,
        'Reminder': Clock,
        'Payment': CreditCard,
        'Activity': Activity
    };
    return icons[type] || Mail;
};

const getTypeLabel = (type) => {
    const labels = { 'Message': 'Mensaje', 'Alert': 'Alerta', 'Reminder': 'Recordatorio', 'Payment': 'Pago', 'Activity': 'Actividad' };
    return labels[type] || type;
};

export default function Notifications() {
    const { user, loading: authLoading, permissions } = useAuth();
    const [activeTab, setActiveTab] = useState('inbox');
    const [notifications, setNotifications] = useState([]);
    const [sentNotifications, setSentNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showComposeModal, setShowComposeModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [sendMode, setSendMode] = useState('broadcast');
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState('all');
    const [sending, setSending] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        targetRole: 'all',
        targetUserId: '',
        type: 'Message',
        priority: 'Normal'
    });

    const canSend = true;

    useEffect(() => {
        if (user && !authLoading && localStorage.getItem('sb-access-token')) {
            loadNotifications();
            if (canSend) {
                loadUsers();
                loadSentNotifications();
            }
        }
    }, [user, authLoading, permissions]);

    const loadUsers = async () => {
        try {
            const res = await crudApi.getAll('user', { IsActive: 1 });
            setUsers(res.data || []);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    };

    const loadNotifications = async () => {
        try {
            const res = await businessApi.notifications.getMyNotifications();
            setNotifications(res.data.data || []);
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error("Error cargando notificaciones:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const loadSentNotifications = async () => {
        try {
            const res = await businessApi.notifications.getSentNotifications();
            setSentNotifications(res.data.data || []);
        } catch (error) {
            console.error("Error cargando enviados:", error);
        }
    };

    const handleMarkRead = async (notificationId) => {
        try {
            await businessApi.notifications.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.NotificationID === notificationId ? { ...n, IsRead: 1 } : n)
            );
            if (selectedNotification?.NotificationID === notificationId) {
                setSelectedNotification(prev => ({ ...prev, IsRead: 1 }));
            }
        } catch (error) {
            console.error("Error marcando como leída:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await businessApi.notifications.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, IsRead: 1 })));
        } catch (error) {
            console.error("Error marcando todas como leídas:", error);
        }
    };

    const handleDelete = async (notificationId) => {
        if (!confirm('¿Eliminar esta notificación?')) return;
        try {
            await businessApi.notifications.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.NotificationID !== notificationId));
            if (selectedNotification?.NotificationID === notificationId) {
                setSelectedNotification(null);
            }
        } catch (error) {
            console.error("Error eliminando notificación:", error);
        }
    };

    const handleSendNotification = async () => {
        if (!newNotification.message.trim()) {
            alert('El mensaje es requerido');
            return;
        }
        setSending(true);
        try {
            if (sendMode === 'individual') {
                if (!newNotification.targetUserId) {
                    alert('Selecciona un usuario');
                    setSending(false);
                    return;
                }
                await businessApi.notifications.send({
                    receiverId: parseInt(newNotification.targetUserId),
                    subject: newNotification.title || 'Sin asunto',
                    message: newNotification.message,
                    type: newNotification.type,
                    priority: newNotification.priority
                });
            } else {
                await businessApi.notifications.broadcastToRole({
                    roleId: newNotification.targetRole,
                    subject: newNotification.title || 'Sin asunto',
                    message: newNotification.message,
                    type: newNotification.type,
                    priority: newNotification.priority
                });
            }
            alert('Notificación enviada exitosamente');
            setShowComposeModal(false);
            resetComposeForm();
            loadSentNotifications();
        } catch (error) {
            console.error("Error enviando notificación:", error);
            alert('Error al enviar notificación');
        } finally {
            setSending(false);
        }
    };

    const resetComposeForm = () => {
        setNewNotification({
            title: '',
            message: '',
            targetRole: 'all',
            targetUserId: '',
            type: 'Message',
            priority: 'Normal'
        });
        setSendMode('broadcast');
    };

    const openNotification = (notification) => {
        setSelectedNotification(notification);
        if (!notification.IsRead && activeTab === 'inbox') {
            handleMarkRead(notification.NotificationID);
        }
    };

    const getFilteredNotifications = () => {
        const list = activeTab === 'inbox' ? notifications : sentNotifications;
        if (filter === 'all') return list;
        if (filter === 'unread') return list.filter(n => !n.IsRead);
        return list.filter(n => n.Type === filter);
    };

    const unreadCount = notifications.filter(n => !n.IsRead).length;

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ minHeight: '70vh' }}>
                <div className="flex h-full">
                    <div className="w-64 bg-gray-50 border-r p-4 flex flex-col">
                        {canSend && (
                            <button
                                onClick={() => setShowComposeModal(true)}
                                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 mb-6 shadow-md"
                            >
                                <Send size={20} />
                                Redactar
                            </button>
                        )}

                        <nav className="space-y-1">
                            <button
                                onClick={() => { setActiveTab('inbox'); setSelectedNotification(null); }}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                                    activeTab === 'inbox' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-700'
                                }`}
                            >
                                <Inbox size={20} />
                                <span className="flex-1">Bandeja de entrada</span>
                                {unreadCount > 0 && (
                                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            {canSend && (
                                <button
                                    onClick={() => { setActiveTab('sent'); setSelectedNotification(null); }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left ${
                                        activeTab === 'sent' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200 text-gray-700'
                                    }`}
                                >
                                    <Send size={20} />
                                    <span>Enviados</span>
                                </button>
                            )}
                        </nav>

                        <div className="mt-6 pt-4 border-t">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Filtrar por</p>
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full border rounded-lg px-2 py-1 text-sm"
                            >
                                <option value="all">Todos</option>
                                <option value="unread">No leídos</option>
                                <option value="Message">Mensajes</option>
                                <option value="Alert">Alertas</option>
                                <option value="Reminder">Recordatorios</option>
                                <option value="Payment">Pagos</option>
                                <option value="Activity">Actividades</option>
                            </select>
                        </div>

                        {activeTab === 'inbox' && unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <CheckCheck size={16} />
                                Marcar todo como leído
                            </button>
                        )}
                    </div>

                    <div className="flex-1 flex">
                        <div className={`${selectedNotification ? 'w-1/3 border-r' : 'w-full'} overflow-auto`}>
                            <div className="p-4 border-b bg-gray-50">
                                <h2 className="font-semibold text-gray-800">
                                    {activeTab === 'inbox' ? 'Bandeja de entrada' : 'Enviados'}
                                </h2>
                            </div>
                            
                            {getFilteredNotifications().length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                                    <p>No hay notificaciones</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {getFilteredNotifications().map(notification => {
                                        const TypeIcon = getTypeIcon(notification.Type);
                                        const isSelected = selectedNotification?.NotificationID === notification.NotificationID;
                                        return (
                                            <div
                                                key={notification.NotificationID}
                                                onClick={() => openNotification(notification)}
                                                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                                                    isSelected ? 'bg-blue-50' : ''
                                                } ${!notification.IsRead && activeTab === 'inbox' ? 'bg-blue-25' : ''}`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-full ${
                                                        notification.IsRead || activeTab === 'sent' 
                                                            ? 'bg-gray-100 text-gray-500' 
                                                            : 'bg-blue-100 text-blue-600'
                                                    }`}>
                                                        <TypeIcon size={16} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-medium truncate ${
                                                                !notification.IsRead && activeTab === 'inbox' ? 'text-gray-900' : 'text-gray-600'
                                                            }`}>
                                                                {notification.Subject || 'Sin asunto'}
                                                            </span>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(notification.Priority)}`}>
                                                                {getPriorityLabel(notification.Priority)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate mt-1">
                                                            {notification.Message}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                            {activeTab === 'inbox' && notification.sender && (
                                                                <span>De: {notification.sender.FirstName} {notification.sender.LastName}</span>
                                                            )}
                                                            {activeTab === 'sent' && notification.receiver && (
                                                                <span>Para: {notification.receiver.FirstName} {notification.receiver.LastName}</span>
                                                            )}
                                                            <span>•</span>
                                                            <span>{new Date(notification.CreatedAt).toLocaleDateString('es-ES')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {selectedNotification && (
                            <div className="flex-1 flex flex-col">
                                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                                    <button
                                        onClick={() => setSelectedNotification(null)}
                                        className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                    >
                                        <ChevronLeft size={20} />
                                        Volver
                                    </button>
                                    <div className="flex gap-2">
                                        {activeTab === 'inbox' && !selectedNotification.IsRead && (
                                            <button
                                                onClick={() => handleMarkRead(selectedNotification.NotificationID)}
                                                className="text-green-600 hover:text-green-700 p-2"
                                                title="Marcar como leída"
                                            >
                                                <Check size={20} />
                                            </button>
                                        )}
                                        {activeTab === 'inbox' && (
                                            <button
                                                onClick={() => handleDelete(selectedNotification.NotificationID)}
                                                className="text-red-600 hover:text-red-700 p-2"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 p-6 overflow-auto">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(selectedNotification.Priority)}`}>
                                            {getPriorityLabel(selectedNotification.Priority)}
                                        </span>
                                        <span className="text-sm text-gray-500 flex items-center gap-1">
                                            {React.createElement(getTypeIcon(selectedNotification.Type), { size: 16 })}
                                            {getTypeLabel(selectedNotification.Type)}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        {selectedNotification.Subject || 'Sin asunto'}
                                    </h2>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-4 border-b">
                                        {activeTab === 'inbox' && selectedNotification.sender && (
                                            <span>
                                                <strong>De:</strong> {selectedNotification.sender.FirstName} {selectedNotification.sender.LastName} 
                                                ({selectedNotification.sender.Email})
                                            </span>
                                        )}
                                        {activeTab === 'sent' && selectedNotification.receiver && (
                                            <span>
                                                <strong>Para:</strong> {selectedNotification.receiver.FirstName} {selectedNotification.receiver.LastName}
                                                ({selectedNotification.receiver.Email})
                                            </span>
                                        )}
                                        <span>
                                            {new Date(selectedNotification.CreatedAt).toLocaleString('es-ES')}
                                        </span>
                                    </div>

                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {selectedNotification.Message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showComposeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-xl font-bold">Nueva Notificación</h3>
                            <button
                                onClick={() => { setShowComposeModal(false); resetComposeForm(); }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setSendMode('broadcast')}
                                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
                                        sendMode === 'broadcast' 
                                            ? 'bg-white shadow text-blue-600' 
                                            : 'text-gray-600'
                                    }`}
                                >
                                    <Users size={18} />
                                    Enviar por Rol
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSendMode('individual')}
                                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition ${
                                        sendMode === 'individual' 
                                            ? 'bg-white shadow text-blue-600' 
                                            : 'text-gray-600'
                                    }`}
                                >
                                    <User size={18} />
                                    Usuario Específico
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {sendMode === 'broadcast' ? 'Destinatarios' : 'Usuario'}
                                </label>
                                {sendMode === 'broadcast' ? (
                                    <select
                                        value={newNotification.targetRole}
                                        onChange={(e) => setNewNotification({...newNotification, targetRole: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="all">Todos los usuarios</option>
                                        <option value="Representante">Representantes</option>
                                        <option value="Empleado">Empleados</option>
                                        <option value="Admin">Administradores</option>
                                    </select>
                                ) : (
                                    <select
                                        value={newNotification.targetUserId}
                                        onChange={(e) => setNewNotification({...newNotification, targetUserId: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="">Seleccionar usuario...</option>
                                        {users.map(u => (
                                            <option key={u.UserID} value={u.UserID}>
                                                {u.FirstName} {u.LastName} ({u.Email})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Asunto
                                </label>
                                <input
                                    type="text"
                                    value={newNotification.title}
                                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="Asunto de la notificación"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo
                                    </label>
                                    <select
                                        value={newNotification.type}
                                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="Message">Mensaje</option>
                                        <option value="Alert">Alerta</option>
                                        <option value="Reminder">Recordatorio</option>
                                        <option value="Payment">Pago</option>
                                        <option value="Activity">Actividad</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Prioridad
                                    </label>
                                    <select
                                        value={newNotification.priority}
                                        onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value="Low">Baja</option>
                                        <option value="Normal">Normal</option>
                                        <option value="High">Alta</option>
                                        <option value="Urgent">Urgente</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mensaje
                                </label>
                                <textarea
                                    value={newNotification.message}
                                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows="6"
                                    placeholder="Escribe tu mensaje aquí..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 p-4 border-t bg-gray-50">
                            <button
                                onClick={handleSendNotification}
                                disabled={!newNotification.message.trim() || sending}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        Enviar Notificación
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => { setShowComposeModal(false); resetComposeForm(); }}
                                className="px-6 py-2 border rounded-lg hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}

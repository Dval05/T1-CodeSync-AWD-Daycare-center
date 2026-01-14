import React, { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import { businessApi } from '../api/business';
import { Bell, Check, Trash2, Send } from 'lucide-react';

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSendModal, setShowSendModal] = useState(false);
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        targetRole: 'all'
    });

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const res = await businessApi.notifications.getMy();
            setNotifications(res.data || []);
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await businessApi.notifications.markRead(id);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error("Error marcando como leída:", error);
        }
    };

    const handleSendBroadcast = async () => {
        try {
            await businessApi.notifications.broadcast(newNotification);
            alert('Notificación enviada exitosamente');
            setShowSendModal(false);
            setNewNotification({ title: '', message: '', targetRole: 'all' });
        } catch (error) {
            console.error("Error enviando notificación:", error);
            alert('Error al enviar notificación');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Cargando notificaciones...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Notificaciones</h2>
                <button 
                    onClick={() => setShowSendModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <Send size={20} />
                    Enviar Notificación
                </button>
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No tienes notificaciones</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map(notification => (
                        <div 
                            key={notification.id}
                            className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                                notification.isRead ? 'border-gray-300' : 'border-blue-600'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-800">
                                        {notification.title}
                                    </h3>
                                    <p className="text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.createdAt).toLocaleString('es-ES')}
                                    </p>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(notification.id)}
                                            className="text-green-600 hover:text-green-700"
                                            title="Marcar como leída"
                                        >
                                            <Check size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para Enviar Notificación */}
            {showSendModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Enviar Notificación</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={newNotification.title}
                                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    placeholder="Título de la notificación"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mensaje
                                </label>
                                <textarea
                                    value={newNotification.message}
                                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows="4"
                                    placeholder="Contenido del mensaje"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Destinatarios
                                </label>
                                <select
                                    value={newNotification.targetRole}
                                    onChange={(e) => setNewNotification({...newNotification, targetRole: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2"
                                >
                                    <option value="all">Todos</option>
                                    <option value="Representante">Representantes</option>
                                    <option value="Empleado">Empleados</option>
                                    <option value="Admin">Administradores</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button
                                onClick={handleSendBroadcast}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Enviar
                            </button>
                            <button
                                onClick={() => setShowSendModal(false)}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
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
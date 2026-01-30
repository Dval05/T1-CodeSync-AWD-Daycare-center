import { useState, useEffect, useCallback, useRef } from 'react';
import { businessApi } from '../api/business';
import { useAuth } from '../context/AuthContext';

const POLLING_INTERVAL = 30000;

export const useNotifications = () => {
    const { user, loading: authLoading } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const previousCountRef = useRef(0);

    const isReady = user && !authLoading && localStorage.getItem('sb-access-token');

    const playNotificationSound = useCallback(() => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('No se pudo reproducir el sonido de notificación');
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        if (!isReady) return;
        try {
            const response = await businessApi.notifications.getUnreadCount();
            const newCount = response.data.count;
            
            if (newCount > previousCountRef.current) {
                playNotificationSound();
            }
            
            previousCountRef.current = newCount;
            setUnreadCount(newCount);
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Error fetching unread count:', error);
            }
        }
    }, [playNotificationSound, isReady]);

    const fetchNotifications = useCallback(async () => {
        if (!isReady) return;
        setLoading(true);
        try {
            const response = await businessApi.notifications.getMyNotifications();
            setNotifications(response.data.data || []);
        } catch (error) {
            if (error?.response?.status !== 401) {
                console.error('Error fetching notifications:', error);
            }
        } finally {
            setLoading(false);
        }
    }, [isReady]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await businessApi.notifications.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n =>
                    n.NotificationID === notificationId
                        ? { ...n, IsRead: 1, ReadAt: new Date().toISOString() }
                        : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await businessApi.notifications.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, IsRead: 1, ReadAt: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await businessApi.notifications.deleteNotification(notificationId);
            setNotifications(prev =>
                prev.filter(n => n.NotificationID !== notificationId)
            );
            fetchUnreadCount();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (!isReady) return;
        
        fetchUnreadCount();
        fetchNotifications();

        const interval = setInterval(fetchUnreadCount, POLLING_INTERVAL);

        return () => clearInterval(interval);
    }, [isReady, fetchUnreadCount, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchNotifications
    };
};

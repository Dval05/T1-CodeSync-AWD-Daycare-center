import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BUSINESS_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sb-access-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    try {
        if (token === 'custom-auth-token') {
            const saved = localStorage.getItem('user-profile');
            if (saved) {
                const profile = JSON.parse(saved);
                if (profile?.UserID) config.headers['x-dev-user'] = String(profile.UserID);
            }
        }
    } catch (e) {
    }
    // During local development, add a dev user header so UI calls pass requireAuth
    try {
        if (import.meta.env.DEV && !config.headers['x-dev-user']) {
            const saved = localStorage.getItem('user-profile');
            if (saved) {
                const profile = JSON.parse(saved);
                if (profile?.UserID) config.headers['x-dev-user'] = String(profile.UserID);
            } else {
                // Default dev user id
                config.headers['x-dev-user'] = '1';
            }
        }
    } catch (e) {}
    return config;
});

export const businessApi = {
    auth: {
        syncGoogle: () => api.post('/auth/sync-google'),
        provision: (data) => api.post('/auth/provision', data),
    },
    students: {
        intake: (data) => api.post('/students/intake', data),
        balance: (id) => api.get(`/students/${id}/balance`),
        calculations: (id) => api.get(`/students/${id}/calculations`),
        canDeactivate: (id) => api.get(`/students/${id}/can-deactivate`),
    },
    activities: {
        myFeed: () => api.get('/activities/my-feed'),
    },
    reports: {
        attendance: (params) => api.get('/reports/attendance', { params }),
        studentProgress: (id) => api.get(`/reports/student/${id}/progress`),
    },
    finance: {
        studentBalance: (id) => api.get(`/finance/student/${id}/balance`),
        teacherBalance: (id) => api.get(`/finance/teacher/${id}/balance`),
        generateInvoice: (data) => api.post('/finance/invoice/generate', data),
        registerPayment: (data) => api.post('/finance/payment', data),
        updatePayment: (id, data) => api.patch(`/finance/payment/${id}`, data),
    },
    employees: {
        schedules: () => api.get('/employees/schedules'),
        assignTask: (data) => api.post('/employees/tasks/assign', data),
        getTasks: (id) => api.get(`/employees/${id}/tasks`),
    },
    guardians: {
        students: (id) => api.get(`/guardians/${id}/students`),
        balance: (id) => api.get(`/guardians/${id}/balance`),
        notify: (id, data) => api.post(`/guardians/${id}/notify`, data),
    },
    notifications: {
        getUnreadCount: () => api.get('/notifications/unread-count'),
        getMyNotifications: (limit = 50) => api.get(`/notifications/my?limit=${limit}`),
        getSentNotifications: (limit = 50) => api.get(`/notifications/sent?limit=${limit}`),
        markAsRead: (id) => api.patch(`/notifications/${id}/read`),
        markAllAsRead: () => api.patch('/notifications/mark-all-read'),
        deleteNotification: (id) => api.delete(`/notifications/${id}`),
        send: (data) => api.post('/notifications/send', data),
        broadcastToRole: (data) => api.post('/notifications/broadcast-role', data),
    },
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
};
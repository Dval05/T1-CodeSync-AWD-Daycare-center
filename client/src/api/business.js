import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BUSINESS_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sb-access-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Dev helper: if using the local 'custom-auth-token' (loginWithCredentials),
    // forward the internal UserID so the API can resolve permissions during dev.
    try {
        if (token === 'custom-auth-token') {
            const saved = localStorage.getItem('user-profile');
            if (saved) {
                const profile = JSON.parse(saved);
                if (profile?.UserID) config.headers['x-dev-user'] = String(profile.UserID);
            }
        }
    } catch (e) {
        // ignore JSON parse errors
    }
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
        generateInvoice: (data) => api.post('/finance/invoice/generate', data),
        registerPayment: (data) => api.post('/finance/payment', data),
        getInvoicePdf: (id) => api.get(`/finance/invoice/${id}/pdf`, { responseType: 'blob' }),
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
        getMy: () => api.get('/notifications/my'),
        markRead: (id) => api.patch(`/notifications/${id}/read`),
        broadcast: (data) => api.post('/notifications/broadcast', data),
        send: (data) => api.post('/notifications/send', data),
    },
    // Método directo para llamadas personalizadas
    get: (url, config) => api.get(url, config),
    post: (url, data, config) => api.post(url, data, config),
};
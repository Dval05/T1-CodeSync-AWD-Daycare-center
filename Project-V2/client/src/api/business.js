import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BUSINESS_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sb-access-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
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
    },
    activities: {
        myFeed: () => api.get('/activities/my-feed'),
    },
    reports: {
        attendance: (params) => api.get('/reports/attendance', { params }),
    }
};
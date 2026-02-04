import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_CRUD_URL
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sb-access-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    try {
        if (import.meta.env.DEV && !config.headers['x-dev-user']) {
            const saved = localStorage.getItem('user-profile');
            if (saved) {
                const profile = JSON.parse(saved);
                if (profile?.UserID) config.headers['x-dev-user'] = String(profile.UserID);
            } else {
                config.headers['x-dev-user'] = '1';
            }
        }
    } catch (e) {}
    return config;
});

export const crudApi = {
    
    getAll: (resource, params) => api.get(`/${resource}`, { params }),
    getById: (resource, id) => api.get(`/${resource}/${id}`),
    create: (resource, data) => api.post(`/${resource}`, data),
    update: (resource, id, data) => api.put(`/${resource}/${id}`, data),
    remove: (resource, id) => api.delete(`/${resource}/${id}`),
};
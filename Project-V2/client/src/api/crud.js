import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_CRUD_URL
});

// Interceptor para inyectar el token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('sb-access-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const crudApi = {
    // GET /api/student?GradeID=1
    getAll: (resource, params) => api.get(`/${resource}`, { params }),
    getById: (resource, id) => api.get(`/${resource}/${id}`),
    create: (resource, data) => api.post(`/${resource}`, data),
    update: (resource, id, data) => api.put(`/${resource}/${id}`, data),
    remove: (resource, id) => api.delete(`/${resource}/${id}`),
};
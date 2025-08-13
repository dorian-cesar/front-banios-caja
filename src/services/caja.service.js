import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: 'http://localhost:4000/api' });

export const cajaService = {
    list: (params) => api.get('/cajas', params),
    getById: (id) => api.get(`/cajas/${id}`),
    create: (data) => api.post('/cajas', data),
    update: (id, data) => api.put(`/cajas/${id}`, data),
    delete: (id) => api.delete(`/cajas/${id}`),
};

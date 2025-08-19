import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL });

export const cajaService = {
    list: (params) => api.get('/cajas', params),
    getById: (id) => api.get(`/cajas/${id}`),
    create: (data) => api.post('/cajas', data),
    update: (id, data) => api.put(`/cajas/${id}`, data),
    delete: (id) => api.delete(`/cajas/${id}`),
};

import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL });

export const movimientoService = {
    list: (params) => api.get('/movimientos', params),
    getById: (id) => api.get(`/movimientos/${id}`),
    create: (data) => api.post('/movimientos', data),
    update: (id, data) => api.put(`/movimientos/${id}`, data),
    delete: (id) => api.delete(`/movimientos/${id}`),
};

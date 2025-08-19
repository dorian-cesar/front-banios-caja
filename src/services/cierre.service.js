import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL });

export const cierreService = {
    list: (params) => api.get('/aperturas-cierres', params),
    getById: (id) => api.get(`/aperturas-cierres/${id}`),
    create: (data) => api.post('/aperturas-cierres', data),
    update: (id, data) => api.put(`/aperturas-cierres/${id}`, data),
    delete: (id) => api.delete(`/aperturas-cierres/${id}`),
};

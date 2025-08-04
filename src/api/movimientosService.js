import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config.js';

const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const movimientosService = {
    list: (params) => api.get('movimientos', params),
    get: (id) => api.get(`movimientos/${id}`),
    create: (data) => api.post('movimientos', data),
    update: (id, data) => api.put(`movimientos/${id}`, data),
    delete: (id) => api.delete(`movimientos/${id}`)
};

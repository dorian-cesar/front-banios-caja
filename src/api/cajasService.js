import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config.js';
const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const cajasService = {
    list: (params) => api.get('cajas', params),
    get: (id) => api.get(`cajas/${id}`),
    create: (data) => api.post('cajas', data),
    update: (id, data) => api.put(`cajas/${id}`, data),
    delete: (id) => api.delete(`cajas/${id}`)
};
import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config/config.js';
const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const aperturasCierresService = {
    list: (params) => api.get('aperturas-cierres', params),
    get: (id) => api.get(`aperturas-cierres/${id}`),
    create: (data) => api.post('aperturas-cierres', data),
    update: (id, data) => api.put(`aperturas-cierres/${id}`, data),
    delete: (id) => api.delete(`aperturas-cierres/${id}`)
};
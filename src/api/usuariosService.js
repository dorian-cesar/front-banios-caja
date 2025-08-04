import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config.js';

const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const usuariosService = {
    list: (params) => api.get('users', params),
    get: (id) => api.get(`users/${id}`),
    create: (data) => api.post('users', data),
    update: (id, data) => api.put(`users/${id}`, data),
    delete: (id) => api.delete(`users/${id}`),
    getRoles: () => api.get('users/roles')
};

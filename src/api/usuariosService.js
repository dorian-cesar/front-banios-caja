import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config.js';

const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const usuariosService = {
    list: (params) => api.get('users', params),
    get: (id) => api.get(`users/${id}`),
    // etc.
};

import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config/config.js';
const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const helpersService = {
    getData: () => api.get('helpers/metadata'),
    getResumen: () => api.get('helpers/resumen')
};
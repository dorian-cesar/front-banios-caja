import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config/config.js';

const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const serviciosService = {
  list: (params) => api.get('services', params),
  get: (id) => api.get(`services/${id}`),
  create: (data) => api.post('services', data),
  update: (id, data) => api.put(`services/${id}`, data),
  delete: (id) => api.delete(`services/${id}`),
  getTipos: () => api.get('services/tipo')
};

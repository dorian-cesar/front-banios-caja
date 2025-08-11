import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config/config.js';

const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const authService = {
  login: (credentials) => api.post('auth/login', credentials),
  logout: () => api.post('auth/logout'),
  me: () => api.get('auth/me')
};

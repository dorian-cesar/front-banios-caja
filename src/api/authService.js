import { ApiClient } from './apiClient.js';
import { CONFIG } from '../config.js';

const api = new ApiClient({ baseUrl: CONFIG.BASE_API_URL });

export const authService = {
  login(email, password) {
    return api.post('/auth/login', { email, password });
  }
};

import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: 'http://localhost:4000/api' });

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
};

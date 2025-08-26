import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL });

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    forgot: ({ email }) => api.post('auth/forgot', { email }),
    reset: ({ token, newPassword }) => api.post('/auth/reset', { token, newPassword })
};

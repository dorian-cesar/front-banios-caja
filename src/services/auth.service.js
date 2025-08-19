import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL });

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
};

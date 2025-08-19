import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: process.env.NEXT_PUBLIC_BASE_URL });

export const helperService = {
    getMetadata: () => api.get('/helpers/metadata'),
    getResumen: () => api.get('/helpers/resumen'),
};

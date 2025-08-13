import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: 'http://localhost:4000/api' });

export const helperService = {
    getMetadata: () => api.get('/helpers/metadata'),
    getResumen: () => api.get('/helpers/resumen'),
};

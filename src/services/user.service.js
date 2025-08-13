import { ApiClient } from '@/lib/apiClient';

const api = new ApiClient({ baseUrl: 'http://localhost:4000/api' });

export const userService = {
    list: (params) => api.get('/users', params),
    listRoles: () => api.get('/users/roles'),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

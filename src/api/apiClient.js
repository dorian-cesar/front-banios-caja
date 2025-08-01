import { getToken } from '../utils/session.js';

export class ApiClient {
    constructor({ baseUrl = '' } = {}) {
        this.baseUrl = baseUrl;
    }

    async request(path, { method = 'GET', params = {}, body = null } = {}) {
        // Forzar que el path empiece con "/"
        if (!path.startsWith('/')) {
            path = '/' + path;
        }

        const url = new URL(this.baseUrl + path);

        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

        const opts = { method, headers: { 'Content-Type': 'application/json' } };
        const token = getToken();
        if (token) opts.headers['Authorization'] = `Bearer ${token}`;
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(url.toString(), opts);
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || `API error ${res.status}`);
        }
        return res.json();
    }

    get(path, params) { return this.request(path, { method: 'GET', params }); }
    post(path, body) { return this.request(path, { method: 'POST', body }); }
    put(path, body) { return this.request(path, { method: 'PUT', body }); }
    delete(path) { return this.request(path, { method: 'DELETE' }); }
}

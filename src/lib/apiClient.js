import { getToken } from "@/utils/session";

export class ApiClient {
  constructor({ baseUrl = '' } = {}) {
    this.baseUrl = baseUrl;
  }

  async request(path, { method = 'GET', params = {}, body = null } = {}) {

    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    // Construir URL con parámetros
    const url = new URL(this.baseUrl + path);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });

    // Configuración de la request
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    // Token si existe
    const token = getToken();
    if (token) opts.headers['Authorization'] = `Bearer ${token}`;

    // Cuerpo JSON si aplica
    if (body) opts.body = JSON.stringify(body);

    // Llamada
    const res = await fetch(url.toString(), opts);
    if (!res.ok) {
      let errorText;
      try {
        errorText = await res.text();
      } catch {
        errorText = `Error ${res.status}`;
      }
      throw new Error(errorText || `API error ${res.status}`);
    }

    return res.json();
  }

  get(path, params) { return this.request(path, { method: 'GET', params }); }
  post(path, body) { return this.request(path, { method: 'POST', body }); }
  put(path, body) { return this.request(path, { method: 'PUT', body }); }
  delete(path) { return this.request(path, { method: 'DELETE' }); }
}

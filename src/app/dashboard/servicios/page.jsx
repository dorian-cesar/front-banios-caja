'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { serviceService } from '@/services/service.service';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await serviceService.list({ page, pageSize, search });
      setServices(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro quieres eliminar este servicio?')) return;
    try {
      await serviceService.delete(id);
      fetchServices();
    } catch (err) {
      alert(err.message || 'Error al eliminar servicio');
    }
  };

  return (
    <div>
      <h1>Servicios</h1>
      <input
        type="text"
        placeholder="Buscar por nombre o tipo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Link href="/dashboard/servicios/new">Nuevo Servicio</Link>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.nombre}</td>
                  <td>{s.tipo}</td>
                  <td>{s.precio}</td>
                  <td>{s.estado}</td>
                  <td>
                    <a href={`/dashboard/servicios/${s.id}`}>Editar</a>{' '}
                    <button onClick={() => handleDelete(s.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
            <span> Página {page} </span>
            <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>Siguiente</button>
          </div>
        </>
      )}
    </div>
  );
}

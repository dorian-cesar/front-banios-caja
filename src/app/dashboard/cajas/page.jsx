'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cajaService } from '@/services/caja.service';

export default function CajasPage() {
  const [cajas, setCajas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchCajas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cajaService.list({ page, pageSize, search });
      setCajas(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || 'Error al cargar cajas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCajas();
  }, [page, search]);

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro quieres eliminar esta caja?')) return;
    try {
      await cajaService.delete(id);
      fetchCajas(); // recargar
    } catch (err) {
      alert(err.message || 'Error al eliminar la caja');
    }
  };

  return (
    <div>
      <h1>Cajas</h1>
      <input
        type="text"
        placeholder="Buscar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Link href="/dashboard/cajas/new">Nueva Caja</Link>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Nombre</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cajas.map((caja) => (
                <tr key={caja.id}>
                  <td>{caja.id}</td>
                  <td>{caja.numero_caja}</td>
                  <td>{caja.nombre}</td>
                  <td>{caja.ubicacion}</td>
                  <td>{caja.estado}</td>
                  <td>
                    <Link href={`/dashboard/cajas/${caja.id}`}>Editar</Link>{' '}
                    <button onClick={() => handleDelete(caja.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Anterior
            </button>
            <span> Página {page} </span>
            <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)}>
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
}

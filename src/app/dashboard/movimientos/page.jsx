'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { movimientoService } from '@/services/movimiento.service';
import { helperService } from '@/services/helper.service';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  // Filtros
  const [metadata, setMetadata] = useState({ usuarios: [], servicios: [], cajas: [], mediosPago: [] });
  
  const [filtros, setFiltros] = useState({
    id_usuario: '',
    numero_caja: '',
    id_servicio: '',
    medio_pago: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  const fetchMovimientos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await movimientoService.list({
        page,
        pageSize,
        search,
        ...filtros
      });
      setMovimientos(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || 'Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await helperService.getMetadata();
        setMetadata(res);
      } catch {
        console.warn('Error al cargar metadata de filtros');
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => { fetchMovimientos(); }, [page, search, filtros]);

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro quieres eliminar este movimiento?')) return;
    try {
      await movimientoService.delete(id);
      fetchMovimientos();
    } catch (err) {
      alert(err.message || 'Error al eliminar movimiento');
    }
  };

  const handleFiltroChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  return (
    <div>
      <h1>Movimientos</h1>

      <div>
        <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        <select name="id_usuario" value={filtros.id_usuario} onChange={handleFiltroChange}>
          <option value="">Todos los usuarios</option>
          {metadata.usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>
        <select name="numero_caja" value={filtros.numero_caja} onChange={handleFiltroChange}>
          <option value="">Todas las cajas</option>
          {metadata.cajas.map(c => <option key={c.numero_caja} value={c.numero_caja}>{c.nombre}</option>)}
        </select>
        <select name="id_servicio" value={filtros.id_servicio} onChange={handleFiltroChange}>
          <option value="">Todos los servicios</option>
          {metadata.servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <input type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={handleFiltroChange} />
        <input type="date" name="fecha_fin" value={filtros.fecha_fin} onChange={handleFiltroChange} />
      </div>
      <Link href={"/dashboard/movimientos/new"}>Nuevo Movimiento</Link>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Servicio</th>
                <th>Caja</th>
                <th>Monto</th>
                <th>Medio Pago</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Código</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(m => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nombre_usuario}</td>
                  <td>{m.nombre_servicio}</td>
                  <td>{m.nombre_caja}</td>
                  <td>{m.monto}</td>
                  <td>{m.medio_pago}</td>
                  <td>{new Date(m.fecha).toLocaleDateString()}</td>
                  <td>{m.hora}</td>
                  <td>{m.codigo}</td>
                  <td>
                    <a href={`/dashboard/movimientos/${m.id}`}>Editar</a>{' '}
                    <button onClick={() => handleDelete(m.id)}>Eliminar</button>
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

'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { cierreService } from '@/services/cierre.service';
import { helperService } from '@/services/helper.service';

export default function CierresPage() {
  const [cierres, setCierres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const [metadata, setMetadata] = useState({ usuarios: [], cajas: [], mediosPago: [] });
  const [filtros, setFiltros] = useState({
    id_usuario_apertura: '',
    id_usuario_cierre: '',
    id_usuario: '',
    numero_caja: '',
    estado: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  const fetchCierres = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await cierreService.list({ page, pageSize, search, ...filtros });
      setCierres(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(err.message || 'Error al cargar registros');
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

  useEffect(() => { fetchCierres(); }, [page, search, filtros]);

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro quieres eliminar este registro?')) return;
    try {
      await cierreService.delete(id);
      fetchCierres();
    } catch (err) {
      alert(err.message || 'Error al eliminar registro');
    }
  };

  const handleFiltroChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  return (
    <div>
      <h1>Aperturas/Cierres</h1>

      <div>
        <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
        <select name="id_usuario_apertura" value={filtros.id_usuario_apertura} onChange={handleFiltroChange}>
          <option value="">Usuario apertura</option>
          {metadata.usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>
        <select name="id_usuario_cierre" value={filtros.id_usuario_cierre} onChange={handleFiltroChange}>
          <option value="">Usuario cierre</option>
          {metadata.usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>
        <select name="numero_caja" value={filtros.numero_caja} onChange={handleFiltroChange}>
          <option value="">Caja</option>
          {metadata.cajas.map(c => <option key={c.numero_caja} value={c.numero_caja}>{c.nombre}</option>)}
        </select>
        <select name="estado" value={filtros.estado} onChange={handleFiltroChange}>
          <option value="">Estado</option>
          <option value="abierta">Abierta</option>
          <option value="cerrada">Cerrada</option>
        </select>
        <input type="date" name="fecha_inicio" value={filtros.fecha_inicio} onChange={handleFiltroChange} />
        <input type="date" name="fecha_fin" value={filtros.fecha_fin} onChange={handleFiltroChange} />
      </div>
      <Link href={"/dashboard/cierres/new"}>Nueva Apertura</Link>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Caja</th>
                <th>Usuario Apertura</th>
                <th>Usuario Cierre</th>
                <th>Fecha Apertura</th>
                <th>Hora Apertura</th>
                <th>Fecha Cierre</th>
                <th>Hora Cierre</th>
                <th>Monto Inicial</th>
                <th>Total Efectivo</th>
                <th>Total Tarjeta</th>
                <th>Total General</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cierres.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nombre_caja}</td>
                  <td>{c.nombre_usuario_apertura}</td>
                  <td>{c.nombre_usuario_cierre || '-'}</td>
                  <td>{new Date(c.fecha_apertura).toLocaleDateString()}</td>
                  <td>{c.hora_apertura}</td>
                  <td>{c.fecha_cierre ? new Date(c.fecha_cierre).toLocaleDateString() : '-'}</td>
                  <td>{c.hora_cierre || '-'}</td>
                  <td>{c.monto_inicial}</td>
                  <td>{c.total_efectivo || '-'}</td>
                  <td>{c.total_tarjeta || '-'}</td>
                  <td>{c.total_general || '-'}</td>
                  <td>{c.estado}</td>
                  <td>
                    <a href={`/dashboard/cierres/${c.id}`}>Editar</a>{' '}
                    <button onClick={() => handleDelete(c.id)}>Eliminar</button>
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

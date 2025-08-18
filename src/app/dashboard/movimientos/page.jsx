'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { TableSkeleton } from '@/components/skeletons';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { movimientoService } from '@/services/movimiento.service';
import { helperService } from '@/services/helper.service';
import { formatFecha, formatNumber } from '@/utils/helper';
import { useNotification } from "@/contexts/NotificationContext";

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const { showNotification } = useNotification();

  const [metadata, setMetadata] = useState({
    usuarios: [],
    servicios: [],
    cajas: [],
    mediosPago: []
  });

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
      showNotification({
        type: "error",
        title: "Error",
        message: 'No se pudieron cargar los movimientos',
        duration: 5000
      });
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
        showNotification({
          type: "error",
          title: "Error",
          message: 'No se pudieron cargar los filtros',
          duration: 5000
        });
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => { fetchMovimientos(); }, [page, search, filtros]);

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este movimiento? Esta acción no se puede deshacer.')) {
      showNotification({
        type: "info",
        title: "Cancelado",
        message: "La eliminación fue cancelada",
        duration: 5000
      });
      return;
    }
    try {
      await movimientoService.delete(id);
      fetchMovimientos();
      showNotification({
        type: "success",
        title: "Movimiento eliminado",
        message: "El movimiento se ha eliminado correctamente",
        duration: 5000
      });
    } catch (err) {
      setError(err.message || 'Error al eliminar movimiento');
      showNotification({
        type: "error",
        title: "Error al eliminar",
        message: err.message || 'Error al eliminar movimiento',
        duration: 5000
      });
    }
  };

  const handleFiltroChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Movimientos</h1>
        <Link
          href="/dashboard/movimientos/new"
          className="px-4 py-2 bg-green-600 text-white text-lg font-medium rounded hover:bg-green-800 transition"
        >
          Nuevo Movimiento
        </Link>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Buscar por código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          name="id_usuario"
          value={filtros.id_usuario}
          onChange={handleFiltroChange}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">Todos los usuarios</option>
          {metadata.usuarios.map(u => (
            <option key={u.id} value={u.id}>{u.nombre}</option>
          ))}
        </select>
        <select
          name="numero_caja"
          value={filtros.numero_caja}
          onChange={handleFiltroChange}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">Todas las cajas</option>
          {metadata.cajas.map(c => (
            <option key={c.numero_caja} value={c.numero_caja}>{c.nombre}</option>
          ))}
        </select>
        <select
          name="id_servicio"
          value={filtros.id_servicio}
          onChange={handleFiltroChange}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">Todos los servicios</option>
          {metadata.servicios.map(s => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>
        <select
          name="medio_pago"
          value={filtros.medio_pago}
          onChange={handleFiltroChange}
          className="px-3 py-2 border border-gray-300 rounded"
        >
          <option value="">Todos los medios</option>
          {metadata.mediosPago.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="date"
          name="fecha_inicio"
          value={filtros.fecha_inicio}
          onChange={handleFiltroChange}
          className="px-3 py-2 border border-gray-300 rounded"
        />
        <input
          type="date"
          name="fecha_fin"
          value={filtros.fecha_fin}
          onChange={handleFiltroChange}
          className="px-3 py-2 border border-gray-300 rounded"
        />
      </div>

      {loading && <TableSkeleton rows={10} cols={10} />}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Usuario</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Servicio</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Caja</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Monto</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Medio Pago</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Hora</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Código</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {movimientos.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{m.id}</td>
                  <td className="px-4 py-2">{m.nombre_usuario}</td>
                  <td className="px-4 py-2">{m.nombre_servicio}</td>
                  <td className="px-4 py-2">{m.nombre_caja}</td>
                  <td className="px-4 py-2">{`$${formatNumber(m.monto)}`}</td>
                  <td className="px-4 py-2">{m.medio_pago}</td>
                  <td className="px-4 py-2">{formatFecha(m.fecha)}</td>
                  <td className="px-4 py-2">{m.hora}</td>
                  <td className="px-4 py-2">{m.codigo}</td>
                  <td className="px-4 py-2 space-x-2 flex">
                    <Link
                      href={`/dashboard/movimientos/${m.id}`}
                      className="h-7 w-7 bg-blue-500 text-white rounded hover:bg-blue-800 transition flex items-center justify-center"
                    >
                      <PencilSquareIcon className="h-5 w-5 inline" />
                    </Link>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="h-7 w-7 bg-red-500 text-white rounded hover:bg-red-800 transition flex items-center justify-center"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          <div className="mt-4 flex items-center justify-center space-x-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Anterior
            </button>
            <span className="text-gray-700">
              Página {page} de {Math.ceil(total / pageSize)}
            </span>
            <button
              disabled={page * pageSize >= total}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
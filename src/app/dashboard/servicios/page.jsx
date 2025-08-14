'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { serviceService } from '@/services/service.service';
import { TableSkeleton } from '@/components/skeletons';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatNumber } from '@/utils/helper';

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
    if (!confirm('¿Estás seguro de eliminar este servicio? Esta acción no se puede deshacer.')) return;
    try {
      await serviceService.delete(id);
      fetchServices();
    } catch (err) {
      setError(err.message || 'Error al eliminar servicio');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Servicios</h1>
        <Link
          href="/dashboard/servicios/new"
          className="px-4 py-2 bg-green-600 text-white text-lg font-medium rounded hover:bg-green-800 transition"
        >
          Nuevo Servicio
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre o tipo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      {loading && <TableSkeleton rows={5} cols={6} />}
      {error && <p className="text-red-500 p-3 bg-red-50 rounded-lg">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Precio</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Estado</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{s.id}</td>
                  <td className="px-4 py-2">{s.nombre}</td>
                  <td className="px-4 py-2 capitalize">{s.tipo.toLowerCase()}</td>
                  <td className="px-4 py-2">${formatNumber(s.precio)}</td>
                  <td className="px-4 py-2 capitalize">{s.estado.toLowerCase()}</td>
                  <td className="px-4 py-2 space-x-2 flex">
                    <Link
                      href={`/dashboard/servicios/${s.id}`}
                      className="h-7 w-7 bg-blue-500 text-white rounded hover:bg-blue-800 transition flex items-center justify-center"
                    >
                      <PencilSquareIcon className="h-5 w-5 inline" />
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="h-7 w-7 bg-red-500 text-white rounded hover:bg-red-800 transition flex items-center justify-center"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { movimientoService } from '@/services/movimiento.service';
import { helperService } from '@/services/helper.service';
import { FormSkeleton5 } from '@/components/skeletons';
import { formatNumber, formatTimeForInput } from '@/utils/helper';

export default function EditMovimientoPage() {
    const router = useRouter();
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [metadata, setMetadata] = useState({ usuarios: [], cajas: [], servicios: [], mediosPago: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [registro, meta] = await Promise.all([
                    movimientoService.getById(id),
                    helperService.getMetadata({ usuarios: 1, cajas: 1, servicios: 1, mediosPago: 1 })
                ]);
                setForm({
                    ...registro,
                    monto: formatNumber(registro.monto)
                });
                setMetadata(meta);
            } catch (err) {
                setError(err.message || 'Error al cargar registro');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await movimientoService.update(id, form);
            router.push('/dashboard/movimientos');
        } catch (err) {
            setError(err.message || 'Error al actualizar movimiento');
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este movimiento? Esta acción no se puede deshacer.')) return;
        try {
            await movimientoService.delete(id);
            router.push('/dashboard/movimientos');
        } catch (err) {
            setError(err.message || 'Error al eliminar movimiento');
        }
    };

    if (loading) return <FormSkeleton5 />;
    if (error) return <p className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</p>;
    if (!form) return <p className="text-gray-600 p-4">Movimiento no encontrado</p>;

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Editar Movimiento {form.codigo}
                </h1>
                <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600 transition"
                >
                    Eliminar Movimiento
                </button>
            </div>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Columna Izquierda */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">ID Apertura:</label>
                            <input
                                type="number"
                                step="1"
                                name="id_aperturas_cierres"
                                value={form.id_aperturas_cierres}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Usuario:</label>
                            <select
                                name="id_usuario"
                                value={form.id_usuario}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Seleccione usuario</option>
                                {metadata.usuarios.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Servicio:</label>
                            <select
                                name="id_servicio"
                                value={form.id_servicio}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Seleccione servicio</option>
                                {metadata.servicios.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Caja:</label>
                            <select
                                name="numero_caja"
                                value={form.numero_caja}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Seleccione caja</option>
                                {metadata.cajas.map(c => (
                                    <option key={c.numero_caja} value={c.numero_caja}>
                                        {c.nombre} (Caja #{c.numero_caja})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Medio de pago:</label>
                            <select
                                name="medio_pago"
                                value={form.medio_pago}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                {metadata.mediosPago.map(mp => (
                                    <option key={mp} value={mp}>{mp}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Monto:</label>
                            <input
                                type="number"
                                step="1"
                                name="monto"
                                value={form.monto}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Fecha:</label>
                        <input
                            type="date"
                            name="fecha"
                            value={form.fecha}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Hora:</label>
                        <input
                            type="time"
                            name="hora"
                            value={formatTimeForInput(form.hora)}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Código:</label>
                        <input
                            name="codigo"
                            value={form.codigo}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Link
                        href="/dashboard/movimientos"
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-600 transition"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
}
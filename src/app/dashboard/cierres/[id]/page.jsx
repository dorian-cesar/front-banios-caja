'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';


import { cierreService } from '@/services/cierre.service';
import { helperService } from '@/services/helper.service';
import { FormSkeleton3 } from '@/components/skeletons';
import { formatNumber, formatTimeForInput } from '@/utils/helper';
import { useNotification } from "@/contexts/NotificationContext";

export default function EditCierrePage() {
    const router = useRouter();
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [metadata, setMetadata] = useState({ usuarios: [], cajas: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [registro, meta] = await Promise.all([
                    cierreService.getById(id),
                    helperService.getMetadata({ usuarios: 1, cajas: 1, servicios: 0, mediosPago: 0 })
                ]);
                setForm({
                    ...registro,
                    total_efectivo: formatNumber(registro.total_efectivo),
                    total_tarjeta: formatNumber(registro.total_tarjeta),
                    total_general: formatNumber(registro.total_general),
                });
                setMetadata(meta);
            } catch (err) {
                setError(err.message || 'Error al cargar registro');
                showNotification({
                    type: "error",
                    title: "Error",
                    message: 'Error al cargar registro',
                    duration: 5000
                });
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
            await cierreService.update(id, form);
            showNotification({
                type: "success",
                title: "Registro actualizado",
                message: "Los cambios se han guardado correctamente",
                duration: 5000
            });
            router.push('/dashboard/cierres');
        } catch (err) {
            setError(err.message || 'Error al actualizar registro');
            showNotification({
                type: "error",
                title: "Error al guardar",
                message: err.message || 'Error al actualizar registro',
                duration: 5000
            });
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.')) {
            showNotification({
                type: "info",
                title: "Cancelado",
                message: "La eliminación fue cancelada",
                duration: 5000
            });
            return;
        }
        try {
            await cierreService.delete(id);
            showNotification({
                type: "success",
                title: "Registro eliminado",
                message: "El registro se ha eliminado correctamente",
                duration: 5000
            });
            router.push('/dashboard/cierres');
        } catch (err) {
            setError(err.message || 'Error al eliminar registro');
            showNotification({
                type: "error",
                title: "Error al eliminar",
                message: err.message || 'Error al eliminar registro',
                duration: 5000
            });
        }
    };

    if (loading) return <FormSkeleton3 />;
    if (!form) return <p className="text-gray-600 p-4">Registro no encontrado</p>;

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Editar Cierre #{form.id} - Caja {form.numero_caja}
                </h1>
                {/* <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-600 transition"
                >
                    Eliminar Registro
                </button> */}
            </div>


            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Sección de Cierre */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Datos de Cierre</h2>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Usuario de cierre:</label>
                            <select
                                name="id_usuario_cierre"
                                value={form.id_usuario_cierre || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="">Seleccione usuario</option>
                                {metadata.usuarios.map(u => (
                                    <option key={u.id} value={u.id}>{u.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Fecha cierre:</label>
                                <input
                                    type="date"
                                    name="fecha_cierre"
                                    value={form.fecha_cierre?.split('T')[0] || ''}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Hora cierre:</label>
                                <input
                                    type="time"
                                    name="hora_cierre"
                                    value={formatTimeForInput(form.hora_cierre)}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección de Totales */}
                    {/* <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">Totales</h2>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Efectivo:</label>
                            <input
                                type="number"
                                step="1"
                                name="total_efectivo"
                                value={form.total_efectivo || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Tarjeta:</label>
                            <input
                                type="number"
                                step="1"
                                name="total_tarjeta"
                                value={form.total_tarjeta || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium mb-1">General:</label>
                            <input
                                type="number"
                                step="1"
                                name="total_general"
                                value={form.total_general || ''}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0"
                            />
                        </div>
                    </div> */}
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Observaciones:</label>
                    <textarea
                        name="observaciones"
                        value={form.observaciones || ''}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                <div className="flex items-center space-x-3">
                    <label className="text-gray-700 font-medium">Estado:</label>
                    <select
                        name="estado"
                        value={form.estado || ''}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="abierta">Abierta</option>
                        <option value="cerrada">Cerrada</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/cierres')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancelar
                    </button>
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
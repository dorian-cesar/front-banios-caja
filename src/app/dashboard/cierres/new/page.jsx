'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { cierreService } from '@/services/cierre.service';
import { helperService } from '@/services/helper.service';
import { FormSkeleton2 } from '@/components/skeletons';
import { useNotification } from "@/contexts/NotificationContext";

export default function NewCierrePage() {
    const router = useRouter();
    const [form, setForm] = useState({
        numero_caja: '',
        id_usuario_apertura: '',
        fecha_apertura: '',
        hora_apertura: '',
        monto_inicial: ''
    });
    const [metadata, setMetadata] = useState({ usuarios: [], cajas: [] });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showNotification } = useNotification();

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await helperService.getMetadata({ usuarios: 1, cajas: 1, servicios: 0, mediosPago: 0 });
                setMetadata(res);
            } catch (err) {
                setError('Error al cargar datos de formulario');
                showNotification({
                    type: "error",
                    title: "Error",
                    message: 'No se pudieron cargar los datos del formulario',
                    duration: 5000
                });
            } finally {
                setLoading(false);
            }
        };
        fetchMetadata();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await cierreService.create(form);
            showNotification({
                type: "success",
                title: "Registro creado",
                message: "El registro se ha creado exitosamente",
                duration: 5000
            });
            router.push('/dashboard/cierres');
        } catch (err) {
            setError(err.message || 'Error al crear registro');
            showNotification({
                type: "error",
                title: "Error",
                message: err.message || 'Error al crear registro',
                duration: 5000
            });
        }
    };

    if (loading) return <FormSkeleton2 />;

    return (
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Nueva Apertura de Caja</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Caja:</label>
                    <select
                        name="numero_caja"
                        value={form.numero_caja}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Seleccione una caja</option>
                        {metadata.cajas.map(c => (
                            <option key={c.numero_caja} value={c.numero_caja}>
                                {c.nombre} (Caja #{c.numero_caja})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Usuario apertura:</label>
                    <select
                        name="id_usuario_apertura"
                        value={form.id_usuario_apertura}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="">Seleccione un usuario</option>
                        {metadata.usuarios.map(u => (
                            <option key={u.id} value={u.id}>{u.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Fecha apertura:</label>
                        <input
                            type="date"
                            name="fecha_apertura"
                            value={form.fecha_apertura}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Hora apertura:</label>
                        <input
                            type="time"
                            name="hora_apertura"
                            value={form.hora_apertura}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Monto inicial:</label>
                    <input
                        type="number"
                        step="1"
                        name="monto_inicial"
                        value={form.monto_inicial}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Ej: 0"
                    />
                </div>
                <div className="flex justify-center space-x-10 mt-6">
                    <Link href="/dashboard/cierres" className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-800 transition">Cancelar</Link>
                    <button type="submit" className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-800 transition">
                        Crear Apertura
                    </button>
                </div>
            </form>
        </div>
    );
}
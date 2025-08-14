'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { movimientoService } from '@/services/movimiento.service';
import { helperService } from '@/services/helper.service';
import { FormSkeleton4 } from '@/components/skeletons';

export default function NewMovimientoPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        id_aperturas_cierres: '',
        id_usuario: '',
        id_servicio: '',
        numero_caja: '',
        monto: '',
        medio_pago: 'EFECTIVO',
        fecha: '',
        hora: '',
        codigo: ''
    });

    const [metadata, setMetadata] = useState({ usuarios: [], cajas: [], servicios: [], mediosPago: [] });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await helperService.getMetadata({ usuarios: 1, cajas: 1, servicios: 1, mediosPago: 1 });
                setMetadata(res);
            } catch (err) {
                setError('Error al cargar datos de formulario');
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
            await movimientoService.create(form);
            router.push('/dashboard/movimientos');
        } catch (err) {
            setError(err.message || 'Error al crear movimiento');
        }
    };

    if (loading) return <FormSkeleton4 />;
    if (error) return <p className="text-red-600 p-3">{error}</p>;

    return (
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Nuevo Movimiento</h1>

            {error && <p className="text-red-600 mb-4 p-2 bg-red-50 rounded">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                        placeholder="Ej: 123"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            placeholder="Ej: 10000"
                        />
                    </div>

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
                            value={form.hora}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Código:</label>
                    <input
                        name="codigo"
                        value={form.codigo}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Código del movimiento"
                    />
                </div>

                <div className="flex justify-center space-x-10 mt-6">
                    <Link
                        href="/dashboard/movimientos"
                        className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-800 transition"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-800 transition"
                    >
                        Crear Movimiento
                    </button>
                </div>
            </form>
        </div>
    );
}
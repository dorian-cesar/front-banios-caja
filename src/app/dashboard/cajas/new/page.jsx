'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cajaService } from '@/services/caja.service';

export default function NewCajaPage() {
    const router = useRouter();
    const [form, setForm] = useState({ numero_caja: '', nombre: '', ubicacion: '', estado: 'activa', descripcion: '' });
    const [error, setError] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await cajaService.create(form);
            router.push('/dashboard/cajas');
        } catch (err) {
            setError(err.message || 'Error al crear la caja');
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Nueva Caja</h1>

            {error && (
                <p className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Número:</label>
                    <input
                        type='number'
                        name="numero_caja"
                        value={form.numero_caja}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="0"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Nombre:</label>
                    <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Caja ejemplo"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Ubicación:</label>
                    <input
                        name="ubicacion"
                        value={form.ubicacion}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Terminal ejemplo"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Estado:</label>
                    <select
                        name="estado"
                        value={form.estado}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Descripción:</label>
                    <textarea
                        name="descripcion"
                        value={form.descripcion}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={4}
                    />
                </div>

                <div className="flex justify-center space-x-10 mt-6">
                    <Link href="/dashboard/cajas" className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-800 transition">Cancelar</Link>
                    <button type="submit" className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-800 transition">
                        Crear
                    </button>
                </div>
            </form>
        </div>
    );
}

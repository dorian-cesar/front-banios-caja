'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
        <div>
            <h1>Nueva Caja</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Número:</label>
                    <input name="numero_caja" value={form.numero_caja} onChange={handleChange} required />
                </div>
                <div>
                    <label>Nombre:</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} required />
                </div>
                <div>
                    <label>Ubicación:</label>
                    <input name="ubicacion" value={form.ubicacion} onChange={handleChange} />
                </div>
                <div>
                    <label>Estado:</label>
                    <select name="estado" value={form.estado} onChange={handleChange}>
                        <option value="activa">Activa</option>
                        <option value="inactiva">Inactiva</option>
                    </select>
                </div>
                <div>
                    <label>Descripción:</label>
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange} />
                </div>
                <button type="submit">Crear</button>
            </form>
        </div>
    );
}

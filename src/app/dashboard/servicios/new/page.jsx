'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { serviceService } from '@/services/service.service';

export default function NewServicePage() {
    const router = useRouter();
    const [tipos, setTipos] = useState([]);
    const [form, setForm] = useState({ nombre: '', tipo: '', precio: '', descripcion: '', estado: 'activo' });
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTipos = async () => {
            try {
                const res = await serviceService.listTipos();
                setTipos(res);
                if (res.length) setForm((f) => ({ ...f, tipo: res[0] }));
            } catch {
                setError('Error al cargar tipos de servicio');
            }
        };
        fetchTipos();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await serviceService.create(form);
            router.push('/dashboard/servicios');
        } catch (err) {
            setError(err.message || 'Error al crear servicio');
        }
    };

    return (
        <div>
            <h1>Nuevo Servicio</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nombre:</label>
                    <input name="nombre" value={form.nombre} onChange={handleChange} required />
                </div>
                <div>
                    <label>Tipo:</label>
                    <select name="tipo" value={form.tipo} onChange={handleChange}>
                        {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label>Precio:</label>
                    <input type="number" step="0.01" name="precio" value={form.precio} onChange={handleChange} required />
                </div>
                <div>
                    <label>Descripción:</label>
                    <textarea name="descripcion" value={form.descripcion} onChange={handleChange}></textarea>
                </div>
                <div>
                    <label>Estado:</label>
                    <select name="estado" value={form.estado} onChange={handleChange}>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                <button type="submit">Crear</button>
            </form>
        </div>
    );
}

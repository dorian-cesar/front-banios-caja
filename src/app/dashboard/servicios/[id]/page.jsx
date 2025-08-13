'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { serviceService } from '@/services/service.service';

export default function EditServicePage() {
    const router = useRouter();
    const { id } = useParams();
    const [tipos, setTipos] = useState([]);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [service, tiposList] = await Promise.all([
                    serviceService.getById(id),
                    serviceService.listTipos()
                ]);
                setForm(service);
                setTipos(tiposList);
            } catch (err) {
                setError(err.message || 'Error al cargar servicio');
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
            await serviceService.update(id, form);
            router.push('/dashboard/servicios');
        } catch (err) {
            setError(err.message || 'Error al actualizar servicio');
        }
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!form) return <p>Servicio no encontrado</p>;

    return (
        <div>
            <h1>Editar Servicio {form.nombre}</h1>
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
                    <textarea name="descripcion" value={form.descripcion || ''} onChange={handleChange}></textarea>
                </div>
                <div>
                    <label>Estado:</label>
                    <select name="estado" value={form.estado} onChange={handleChange}>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                <button type="submit">Actualizar</button>
            </form>
        </div>
    );
}

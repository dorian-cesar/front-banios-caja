'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cierreService } from '@/services/cierre.service';
import { helperService } from '@/services/helper.service';

export default function EditCierrePage() {
    const router = useRouter();
    const { id } = useParams();
    const [form, setForm] = useState(null);
    const [metadata, setMetadata] = useState({ usuarios: [], cajas: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [registro, meta] = await Promise.all([
                    cierreService.getById(id),
                    helperService.getMetadata({ usuarios: 1, cajas: 1, servicios: 0, mediosPago: 0 })
                ]);
                setForm(registro);
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
            await cierreService.update(id, form);
            router.push('/dashboard/cierres');
        } catch (err) {
            setError(err.message || 'Error al actualizar registro');
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Seguro quieres eliminar este registro?')) return;
        try {
            await cierreService.delete(id);
            router.push('/dashboard/cierres');
        } catch (err) {
            alert(err.message || 'Error al eliminar registro');
        }
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!form) return <p>Registro no encontrado</p>;

    return (
        <div>
            <h1>Editar Apertura/Cierre {form.id}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                {/* Campos editables: id_usuario_cierre, fecha_cierre, hora_cierre, totales, observaciones, estado */}
                <div>
                    <label>Usuario cierre:</label>
                    <select name="id_usuario_cierre" value={form.id_usuario_cierre || ''} onChange={handleChange}>
                        <option value="">Seleccione</option>
                        {metadata.usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label>Fecha cierre:</label>
                    <input type="date" name="fecha_cierre" value={form.fecha_cierre?.split('T')[0] || ''} onChange={handleChange} />
                </div>
                <div>
                    <label>Hora cierre:</label>
                    <input type="time" name="hora_cierre" value={form.hora_cierre || ''} onChange={handleChange} />
                </div>
                <div>
                    <label>Total efectivo:</label>
                    <input type="number" step="0.01" name="total_efectivo" value={form.total_efectivo || ''} onChange={handleChange} />
                </div>
                <div>
                    <label>Total tarjeta:</label>
                    <input type="number" step="0.01" name="total_tarjeta" value={form.total_tarjeta || ''} onChange={handleChange} />
                </div>
                <div>
                    <label>Total general:</label>
                    <input type="number" step="0.01" name="total_general" value={form.total_general || ''} onChange={handleChange} />
                </div>
                <div>
                    <label>Observaciones:</label>
                    <textarea name="observaciones" value={form.observaciones || ''} onChange={handleChange}></textarea>
                </div>
                <div>
                    <label>Estado:</label>
                    <select name="estado" value={form.estado || ''} onChange={handleChange}>
                        <option value="abierta">Abierta</option>
                        <option value="cerrada">Cerrada</option>
                    </select>
                </div>
                <button type="submit">Actualizar</button>
                <button type="button" onClick={handleDelete} style={{ marginLeft: 10 }}>Eliminar</button>
            </form>
        </div>
    );
}

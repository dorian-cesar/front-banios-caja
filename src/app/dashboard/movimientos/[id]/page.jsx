'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { movimientoService } from '@/services/movimiento.service';
import { helperService } from '@/services/helper.service';

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
            await movimientoService.update(id, form);
            router.push('/dashboard/movimientos');
        } catch (err) {
            setError(err.message || 'Error al actualizar movimiento');
        }
    };

    if (loading) return <p>Cargando...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!form) return <p>Movimiento no encontrado</p>;

    return (
        <div>
            <h1>Editar Movimiento {form.codigo}</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ID apertura</label>
                    <input type="number" step="1" name="id_aperturas_cierres" value={form.id_aperturas_cierres} onChange={handleChange} required />
                </div>
                <div>
                    <label>Usuario:</label>
                    <select name="id_usuario" value={form.id_usuario} onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {metadata.usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label>Servicio:</label>
                    <select name="id_servicio" value={form.id_servicio} onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {metadata.servicios.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label>Caja:</label>
                    <select name="numero_caja" value={form.numero_caja} onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {metadata.cajas.map(c => <option key={c.numero_caja} value={c.numero_caja}>{c.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label>Monto:</label>
                    <input type="number" step="0.01" name="monto" value={form.monto} onChange={handleChange} required />
                </div>
                <div>
                    <label>Medio de pago:</label>
                    <select name="medio_pago" value={form.medio_pago} onChange={handleChange}>
                        <option value="">Seleccione</option>
                        <option value="EFECTIVO">EFECTIVO</option>
                        <option value="TARJETA">TARJETA</option>
                    </select>
                </div>
                <div>
                    <label>Fecha:</label>
                    <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
                </div>
                <div>
                    <label>Hora:</label>
                    <input type="time" name="hora" value={form.hora} onChange={handleChange} required />
                </div>
                <div>
                    <label>Código:</label>
                    <input name="codigo" value={form.codigo} onChange={handleChange} required />
                </div>
                <button type="submit">Actualizar</button>
            </form>
        </div>
    );
}

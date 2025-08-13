'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cierreService } from '@/services/cierre.service';
import { helperService } from '@/services/helper.service';

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

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await helperService.getMetadata({ usuarios: 1, cajas: 1, servicios: 0, mediosPago: 0 });
                setMetadata(res);
            } catch {
                setError('Error al cargar datos de formulario');
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
            router.push('/dashboard/cierres');
        } catch (err) {
            setError(err.message || 'Error al crear registro');
        }
    };

    return (
        <div>
            <h1>Nueva Apertura</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Caja:</label>
                    <select name="numero_caja" value={form.numero_caja} onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {metadata.cajas.map(c => <option key={c.numero_caja} value={c.numero_caja}>{c.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label>Usuario apertura:</label>
                    <select name="id_usuario_apertura" value={form.id_usuario_apertura} onChange={handleChange} required>
                        <option value="">Seleccione</option>
                        {metadata.usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                    </select>
                </div>
                <div>
                    <label>Fecha apertura:</label>
                    <input type="date" name="fecha_apertura" value={form.fecha_apertura} onChange={handleChange} required />
                </div>
                <div>
                    <label>Hora apertura:</label>
                    <input type="time" name="hora_apertura" value={form.hora_apertura} onChange={handleChange} required />
                </div>
                <div>
                    <label>Monto inicial:</label>
                    <input type="number" step="0.01" name="monto_inicial" value={form.monto_inicial} onChange={handleChange} required />
                </div>
                <button type="submit">Crear Apertura</button>
            </form>
        </div>
    );
}

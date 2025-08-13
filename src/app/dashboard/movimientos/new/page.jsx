'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { movimientoService } from '@/services/movimiento.service';
import { helperService } from '@/services/helper.service';

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

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const res = await helperService.getMetadata({ usuarios: 1, cajas: 1, servicios: 1, mediosPago: 1 });
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
            await movimientoService.create(form);
            router.push('/dashboard/movimientos');
        } catch (err) {
            setError(err.message || 'Error al crear movimiento');
        }
    };

    return (
        <div>
            <h1>Nuevo Movimiento</h1>
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
                    <input type="number" step="1" name="monto" value={form.monto} onChange={handleChange} required />
                </div>
                <div>
                    <label>Medio de pago:</label>
                    <select name="medio_pago" value={form.medio_pago} onChange={handleChange}>
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
                <button type="submit">Crear</button>
            </form>
        </div>
    );
}

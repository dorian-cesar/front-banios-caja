'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { cajaService } from '@/services/caja.service';

export default function EditCajaPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaja = async () => {
      try {
        const data = await cajaService.getById(id);
        setForm(data);
      } catch (err) {
        setError(err.message || 'Error al cargar la caja');
      } finally {
        setLoading(false);
      }
    };
    fetchCaja();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await cajaService.update(id, form);
      router.push('/dashboard/cajas');
    } catch (err) {
      setError(err.message || 'Error al actualizar la caja');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!form) return <p>Caja no encontrada</p>;

  return (
    <div>
      <h1>Editar Caja {form.nombre}</h1>
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
          <input name="ubicacion" value={form.ubicacion || ''} onChange={handleChange} />
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
          <textarea name="descripcion" value={form.descripcion || ''} onChange={handleChange} />
        </div>
        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
}

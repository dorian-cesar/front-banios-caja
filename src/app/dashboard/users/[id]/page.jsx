'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { userService } from '@/services/user.service';

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [user, rolesList] = await Promise.all([
          userService.getById(id),
          userService.listRoles()
        ]);
        setForm(user);
        setRoles(rolesList);
      } catch (err) {
        setError(err.message || 'Error al cargar usuario');
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
      await userService.update(id, form);
      router.push('/dashboard/users');
    } catch (err) {
      setError(err.message || 'Error al actualizar usuario');
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!form) return <p>Usuario no encontrado</p>;

  return (
    <div>
      <h1>Editar Usuario {form.username}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div>
          <label>Contraseña (opcional):</label>
          <input type="password" name="password" value={form.password || ''} onChange={handleChange} />
        </div>
        <div>
          <label>Rol:</label>
          <select name="role" value={form.role} onChange={handleChange}>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
}

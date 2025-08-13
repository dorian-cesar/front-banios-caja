'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { userService } from '@/services/user.service';

export default function NewUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const r = await userService.listRoles();
        setRoles(r);
        if (r.length) setForm((f) => ({ ...f, role: r[0] }));
      } catch {
        setError('Error al cargar roles');
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await userService.create(form);
      router.push('/dashboard/users');
    } catch (err) {
      setError(err.message || 'Error al crear usuario');
    }
  };

  return (
    <div>
      <h1>Nuevo Usuario</h1>
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
          <label>Contraseña:</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div>
          <label>Rol:</label>
          <select name="role" value={form.role} onChange={handleChange}>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <button type="submit">Crear</button>
      </form>
    </div>
  );
}

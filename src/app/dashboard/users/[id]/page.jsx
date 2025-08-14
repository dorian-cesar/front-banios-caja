'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { userService } from '@/services/user.service';
import { FormSkeleton2 } from '@/components/skeletons';

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

  if (loading) return <FormSkeleton2 />;
  if (error) return <p className="text-red-600 p-4 bg-red-50 rounded-lg">{error}</p>;
  if (!form) return <p className="text-gray-600 p-4">Usuario no encontrado</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Usuario {form.username}</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Username:</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Email:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Contraseña (dejar en blanco para no cambiar):</label>
          <input
            type="password"
            name="password"
            value={form.password || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="••••••••"
          />
          <p className="text-sm text-gray-500 mt-1">Mínimo 6 caracteres</p>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Rol:</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 capitalize"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r.toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center space-x-10 mt-6">
          <Link
            href="/dashboard/users"
            className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-800 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="bg-blue-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-blue-800 transition"
          >
            Actualizar Usuario
          </button>
        </div>
      </form>
    </div>
  );
}
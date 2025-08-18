'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { userService } from '@/services/user.service';
import { FormSkeleton2 } from '@/components/skeletons';
import { useNotification } from "@/contexts/NotificationContext";

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

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
        showNotification({
          type: "error",
          title: "Error",
          message: 'Error al cargar usuario',
          duration: 5000
        });
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
      showNotification({
        type: "success",
        title: "Usuario actualizado",
        message: "Los cambios se han guardado correctamente",
        duration: 5000
      });
      router.push('/dashboard/users');
    } catch (err) {
      setError(err.message || 'Error al actualizar usuario');
      showNotification({
        type: "error",
        title: "Error al guardar",
        message: err.message || 'Error al actualizar usuario',
        duration: 5000
      });
    }
  };

  if (loading) return <FormSkeleton2 />;
  if (!form) return <p className="text-gray-600 p-4">Usuario no encontrado</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Editar Usuario {form.username}</h1>

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
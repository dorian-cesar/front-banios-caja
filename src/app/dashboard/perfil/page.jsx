'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from "@/utils/session";
import { userService } from '@/services/user.service';
import { FormSkeleton2 } from '@/components/skeletons';
import { useNotification } from "@/contexts/NotificationContext";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        const u = getCurrentUser();
        setUser(u);

        const fetchData = async () => {
            try {
                const [userData, rolesList] = await Promise.all([
                    userService.getById(u.id),
                    userService.listRoles()
                ]);
                setForm(userData);
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
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // 🔹 Validaciones
        if (!form.username || form.username.trim().length < 3) {
            showNotification({
                type: "warning",
                title: "Nombre de usuario inválido",
                message: "El nombre de usuario debe tener al menos 3 caracteres.",
                duration: 4000
            });
            return;
        }

        if (!isValidEmail(form.email)) {
            showNotification({
                type: "warning",
                title: "Correo inválido",
                message: "Por favor ingresa un correo electrónico válido.",
                duration: 4000
            });
            return;
        }

        if (form.password && form.password.length < 6) {
            showNotification({
                type: "warning",
                title: "Contraseña demasiado corta",
                message: "La contraseña debe tener al menos 6 caracteres.",
                duration: 4000
            });
            return;
        }

        try {
            await userService.update(user.id, form);
            showNotification({
                type: "success",
                title: "Usuario actualizado",
                message: "Los cambios se han guardado correctamente",
                duration: 5000
            });
            router.back(); // 👈 fix
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
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-red-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-red-800 transition"
                    >
                        Cancelar
                    </button>
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

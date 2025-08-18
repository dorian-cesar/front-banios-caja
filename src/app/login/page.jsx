"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { saveSession } from "@/utils/session";
import { useNotification } from "@/contexts/NotificationContext";
import { LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.login({ email, password });
            saveSession(data.token, data.user);

            showNotification({
                type: "success",
                title: "Login exitoso",
                message: `Bienvenido ${data.user.username}`,
                duration: 5000
            });

            router.push("/dashboard");
        } catch (err) {
            let errorMessage = "Error al iniciar sesión";

            try {
                const parsedError = JSON.parse(err.message);
                errorMessage = parsedError.error || err.message;
            } catch {
                errorMessage = err.message || "Ocurrió un error inesperado";
            }

            showNotification({
                type: "error",
                title: "Error de autenticación",
                message: errorMessage,
                duration: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">Bienvenido</h1>
                    <p className="text-gray-600">Ingresa tus credenciales para acceder al sistema</p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
                    noValidate
                >
                    <div className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="tu@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Contraseña
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all flex items-center justify-center ${loading
                                        ? "bg-blue-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </>
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>¿Problemas para ingresar? <a href="#" className="text-blue-600 hover:text-blue-800">Contacta al administrador</a></p>
                </div>
            </div>
        </div>
    );
}
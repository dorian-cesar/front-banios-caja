"use client";
import Link from "next/link";
import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { authService } from "@/services/auth.service";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

export default function ForgotPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    const isValidEmail = (value) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            showNotification({
                type: "warning",
                title: "Correo inválido",
                message: "Ingresa un correo electrónico válido.",
                duration: 4000,
            });
            return;
        }

        setLoading(true);
        try {
            const res = await authService.forgot({ email });
            // El backend devuelve siempre un mensaje genérico
            showNotification({
                type: "success",
                title: "Revisa tu correo",
                message: res?.message ?? "Si el correo existe, te enviamos instrucciones.",
                duration: 6000,
            });
        } catch (err) {
            showNotification({
                type: "error",
                title: "No se pudo enviar",
                message: err?.message || "Intenta nuevamente.",
                duration: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">Restablecer contraseña</h1>
                    <p className="text-gray-600">
                        Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-8 rounded-xl shadow-lg border border-gray-200"
                    noValidate
                >
                    <div className="space-y-5">
                        {/* Email */}
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

                        {/* Submit */}
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
                                    <div className="flex items-center justify-center gap-2">
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                        Enviando...
                                    </div>
                                ) : (
                                    "Enviar enlace"
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <Link href="/login" className="text-blue-600 hover:text-blue-800">
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

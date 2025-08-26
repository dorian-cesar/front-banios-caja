"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNotification } from "@/contexts/NotificationContext";
import { authService } from "@/services/auth.service";
import { LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function ResetClient() {
    const router = useRouter();
    const params = useSearchParams();
    const token = useMemo(() => params.get("token") || "", [params]);

    const [pw1, setPw1] = useState("");
    const [pw2, setPw2] = useState("");
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification();

    const validate = () => {
        if (!token) {
            showNotification({ type: "error", title: "Enlace inválido", message: "Abre esta página desde el link del correo.", duration: 5000 });
            return false;
        }
        if (pw1.length < 6) { // o 8 si tu backend valida 8+
            showNotification({ type: "warning", title: "Contraseña muy corta", message: "Debe tener al menos 6 caracteres.", duration: 4000 });
            return false;
        }
        if (pw1 !== pw2) {
            showNotification({ type: "warning", title: "No coinciden", message: "Las contraseñas no coinciden.", duration: 4000 });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const res = await authService.reset({ token, newPassword: pw1 });
            if (res?.ok) {
                showNotification({ type: "success", title: "Contraseña actualizada", message: "Ya puedes iniciar sesión.", duration: 5000 });
                router.replace("/login?reset=ok");
            } else {
                showNotification({ type: "error", title: "No se pudo actualizar", message: res?.message || "El enlace puede haber expirado.", duration: 5000 });
            }
        } catch (err) {
            showNotification({ type: "error", title: "Error", message: err?.message || "Intenta nuevamente.", duration: 5000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-blue-800 mb-2">Crear nueva contraseña</h1>
                    <p className="text-gray-600">Ingresa tu nueva contraseña. El enlace es válido por 30 minutos.</p>
                </div>

                {!token ? (
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
                        <p className="text-red-600 font-medium">Enlace inválido o sin token.</p>
                        <Link href="/forgot" className="inline-block mt-4 text-blue-600 hover:text-blue-800">
                            Volver a &quot;Olvidé mi contraseña&quot;
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200" noValidate>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="pw1" className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="pw1"
                                        type={show1 ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={pw1}
                                        onChange={(e) => setPw1(e.target.value)}
                                        className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        required
                                        minLength={6} // o 8 si cambias backend
                                        autoComplete="new-password"
                                    />
                                    <button type="button" onClick={() => setShow1(!show1)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        {show1 ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="pw2" className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="pw2"
                                        type={show2 ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={pw2}
                                        onChange={(e) => setPw2(e.target.value)}
                                        className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                    />
                                    <button type="button" onClick={() => setShow2(!show2)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                                        {show2 ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all flex items-center justify-center ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                                        }`}
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            Guardando...
                                        </div>
                                    ) : (
                                        "Guardar nueva contraseña"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                <div className="mt-6 text-center text-sm text-gray-600">
                    <Link href="/login" className="text-blue-600 hover:text-blue-800">Volver al inicio de sesión</Link>
                </div>
            </div>
        </div>
    );
}

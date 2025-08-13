"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { saveSession } from "@/utils/session";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await authService.login({ email, password });
            saveSession(data.token, data.user);
            router.push("/dashboard");
        } catch (err) {
            // Manejo de errores según la respuesta del servidor
            if (err.response && err.response.data && err.response.data.error) {
                setError(err.response.data.error);
            } else if (err.response && err.response.status === 500) {
                setError("Error interno del servidor");
            } else {
                setError("Error al iniciar sesión");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-400 p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-lg w-80"
            >
                <h1 className="text-3xl font-bold mb-4">Iniciar sesión</h1>

                
                {error && <p className="text-red-500 mb-2">{error}</p>}

                <input
                    type="email"
                    placeholder="Correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-2"
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border px-3 py-2 rounded mb-4"
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className=" w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    {loading ? "Cargando..." : "Entrar"}
                </button>
            </form>
        </div>
    );
}

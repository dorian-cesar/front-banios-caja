"use client";

import { useRouter } from "next/navigation";
export default function NotFound() {
    const router = useRouter();
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="mt-4 text-xl text-gray-600">Página no encontrada</p>
                <button
                    onClick={() => router.back()}
                    className="mt-6 inline-block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                    Volver atrás
                </button>
            </div>
        </div>
    );
}




"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (    

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-300 p-4">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-bold text-blue-800 mb-4 animate-fade-in">
          Bienvenido al Mantenedor de Baños
        </h1>

        <button
          onClick={() => router.push("/login")}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          Iniciar Sesión
        </button>

        <div className="mt-12 flex justify-center space-x-4">
          <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
          <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
          <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
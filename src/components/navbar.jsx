"use client";
import Link from "next/link";
import { UserIcon, PowerIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearSession } from "@/utils/session"

export default function Navbar() {
    const router = useRouter();
    const [nombre, setNombre] = useState("");

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            const parsedUser = JSON.parse(user);
            setNombre(parsedUser.username);
        }
    }, []);

    return (
        <nav className="flex items-center justify-between bg-gray-800 text-white p-6">
            <Link href={"/dashboard"} className="text-white hover:text-gray-300 transition">
                <h1 className="text-3xl font-bold">Mantenedor de Baños</h1>
            </Link>

            <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-600 transition">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg">
                        <UserIcon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-medium text-lg">{nombre}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transform transition-all duration-200 origin-top-right z-10">
                    <Link
                        href="/dashboard/perfil"
                        className="flex items-center px-4 py-2 hover:bg-gray-300 transition rounded-t-lg"
                    >
                        Ver perfil
                    </Link>
                    <button
                        onClick={() => {
                            clearSession();
                            router.replace("/login");
                            router.refresh()
                        }}
                        className="flex items-center w-full text-left px-4 py-2 hover:bg-gray-300 transition rounded-b-lg"
                    >
                        Cerrar sesión
                        <PowerIcon className="h-5 w-5 ml-2 text-gray-700" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
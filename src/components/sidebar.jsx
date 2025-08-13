import Link from 'next/link';

function Sidebar() {
    return (
        <aside className="w-64 min-h-screen bg-gradient-to-b from-blue-50 to-white border-r border-gray-200 flex flex-col p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-blue-800 mb-1">Panel de Control</h2>
                <div className="w-12 h-1 bg-blue-500 rounded-full"></div>
            </div>

            <nav className="flex-1">
                <ul className="space-y-3">
                    <li>
                        <Link
                            href="/dashboard"
                            className="flex items-center p-3 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 group"
                        >
                            <span className="w-2 h-5 bg-blue-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></span>
                            <span>Inicio</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/users"
                            className="flex items-center p-3 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 group"
                        >
                            <span className="w-2 h-5 bg-blue-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></span>
                            <span>Usuarios</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/cajas"
                            className="flex items-center p-3 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 group"
                        >
                            <span className="w-2 h-5 bg-blue-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></span>
                            <span>Cajas</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/servicios"
                            className="flex items-center p-3 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 group"
                        >
                            <span className="w-2 h-5 bg-blue-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></span>
                            <span>Servicios</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/movimientos"
                            className="flex items-center p-3 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 group"
                        >
                            <span className="w-2 h-5 bg-blue-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></span>
                            <span>Movimientos</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/dashboard/cierres"
                            className="flex items-center p-3 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-all duration-300 group"
                        >
                            <span className="w-2 h-5 bg-blue-500 rounded-full mr-3 group-hover:w-3 transition-all duration-300"></span>
                            <span>Aperturas y Cierres</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">Versión 1.0.0</p>
            </div>
        </aside>
    );
}

export default Sidebar;
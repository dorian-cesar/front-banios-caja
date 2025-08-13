import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

export const metadata = {
    title: 'Mantenedor Baños',
    description: 'Gestión de baños',
};

export default function DashboardLayout({ children }) {
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <Sidebar />
  
        {/* Contenido principal */}
        <div className="flex flex-col flex-1">
          <Navbar />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    );
  }

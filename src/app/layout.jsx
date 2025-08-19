import "@/styles/globals.css";
import { NotificationProvider } from "@/contexts/NotificationContext";
export const metadata = {
    title: 'Inicio de Sesión',
    description: 'Gestión de baños',
    icons: "/favicon.ico"
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className="bg-gradient-to-br from-blue-50 to-indigo-300">
                <NotificationProvider>
                    <main>
                        {children}
                    </main>
                </NotificationProvider>
            </body>
        </html>
    );
}

import "@/styles/globals.css";
import { NotificationProvider } from "@/contexts/NotificationContext";
export const metadata = {
    title: 'Inicio De sesión',
    description: 'Gestión de baños',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className="bg-gradient-to-br from-blue-50 to-indigo-200">
                <NotificationProvider>
                    <main>
                        {children}
                    </main>
                </NotificationProvider>
            </body>
        </html>
    );
}

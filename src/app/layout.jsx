import "@/styles/globals.css";
export const metadata = {
    title: 'Inicio De sesión',
    description: 'Gestión de baños',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body className="bg-gradient-to-br from-blue-50 to-indigo-200">
                <main>
                    {children}
                </main>
            </body>
        </html>
    );
}

import "@/styles/globals.css";
export const metadata = {
    title: 'Inicio De sesión',
    description: 'Gestión de baños',
};

export default function RootLayout({ children }) {
    return (
        <html lang="es">
            <body>
                <main>
                    {children}
                </main>
            </body>
        </html>
    );
}

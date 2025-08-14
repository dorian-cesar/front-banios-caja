export default function ProfilePage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-2xl text-center space-y-8">
                <h1 className="text-5xl font-bold text-blue-800 mb-4 animate-fade-in">
                    Perfil de Usuario
                </h1>
                <p className="text-lg text-gray-700">
                    Aquí puedes ver y editar tu información personal.
                </p>
            </div>
        </div>
    );
};
export function Card({ titulo, valor }) {
    return (
        <div className="bg-white rounded-2xl shadow p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-600">{titulo}</h3>
            <p className="text-2xl font-bold text-gray-900">{valor}</p>
        </div>
    );
}

export function GananciaCard({ titulo, data }) {
    if (!data) return null;

    return (
        <div className="bg-white rounded-2xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4">{titulo}</h3>
            <ul className="space-y-2 text-gray-700">
                {Object.entries(data).map(([medio, valor]) => (
                    <li key={medio} className="flex justify-between">
                        <span className="capitalize">{medio}</span>
                        <span className="font-bold">${valor}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
'use client';
import { useEffect, useState } from 'react';
import { helperService } from '@/services/helper.service';
import { useNotification } from "@/contexts/NotificationContext";
import { DashboardSkeleton } from '@/components/skeletons';
import { Card, GananciaCard } from "@/components/Card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  const fetchResumen = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await helperService.getResumen();
      setResumen(data);
    } catch (err) {
      setError(err.message || 'Error al cargar resumen');
      showNotification({
        type: "error",
        title: "Error",
        message: 'Error al cargar resumen',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
  }, []);

  if (loading) return <DashboardSkeleton />;

  const mediosPagoData = Object.entries(resumen.distribucionMediosPago || {}).map(
    ([key, value]) => ({ name: key, value })
  );

  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722'];
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Resumen</h1>

      {/* Contenedor principal: Cards + Gráfico en la misma fila */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sección de las 4 cards (2/3 del espacio) */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <Card titulo="Usuarios" valor={resumen.totalUsuarios} />
          <Card titulo="Movimientos" valor={resumen.totalMovimientos} />
          <Card titulo="Servicios" valor={resumen.totalServicios} />
          <Card titulo="Cajas" valor={resumen.totalCajas} />
        </div>

        {/* Sección del gráfico (1/3 del espacio) */}
        <div className="bg-white p-6 rounded-2xl shadow h-full">
          <h2 className="text-xl font-semibold mb-4">Distribución por Medios de Pago</h2>
          <div className="w-full h-64">  {/* Ajusta la altura según necesites */}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mediosPagoData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {mediosPagoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sección de GananciaCard (debajo, igual que antes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GananciaCard titulo="Hoy" data={resumen.totalGananciasHoy} />
        <GananciaCard titulo="Esta Semana" data={resumen.totalGananciasSemana} />
        <GananciaCard titulo="Este Mes" data={resumen.totalGananciasMes} />
        <GananciaCard titulo="Este Año" data={resumen.totalGananciasAnio} />
      </div>
    </div>
  );
}
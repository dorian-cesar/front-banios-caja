import { getCurrentUser } from '../utils/session.js';
import { usuariosService } from '../api/usuariosService.js';
import { movimientosService } from '../api/movimientosService.js';
import { showAlert } from '../components/alerts.js';

export async function initDashboard() {
    const user = getCurrentUser();
    document.getElementById('user-name').textContent = user?.username || user?.nombre || 'Usuario';

    try {
        // Pedimos solo la página 1 con pageSize = 10 para mostrar resumen rápido
        const [usuariosResp, movimientosResp] = await Promise.all([
            usuariosService.list({ page: 1, pageSize: 10 }),
            movimientosService.list({ page: 1, pageSize: 10 }),
        ]);

        // Mostrar totales (total viene directo del backend)
        document.getElementById('card-total-usuarios').textContent = usuariosResp.total;
        document.getElementById('card-total-movimientos').textContent = movimientosResp.total;

        // Calcular ingresos del día sumando solo los datos traídos (podrías pedir todos si quieres)
        const ingresosDia = movimientosResp.data.reduce((sum, m) => sum + parseFloat(m.monto), 0);
        document.getElementById('card-ingresos').textContent = 'CLP ' + ingresosDia.toFixed(2);

        // Opcional: si quieres mostrar la lista de usuarios o movimientos de esta página:
        // usuariosResp.data => array de usuarios de la página 1
        // movimientosResp.data => array de movimientos de la página 1

    } catch (err) {
        showAlert('Error al cargar resumen: ' + err.message, 'danger');
    }
}

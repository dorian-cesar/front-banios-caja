import { getCurrentUser } from '../utils/session.js';
import { usuariosService } from '../api/usuariosService.js';
import { movimientosService } from '../api/movimientosService.js';
import { helpersService } from '../api/helpersService.js';
import { serviciosService } from '../api/serviciosService.js';
import { cajasService } from '../api/cajasService.js';
import { showAlert } from '../components/alerts.js';
import { getSantiagoDateParts } from '../utils/helpers.js';
import { renderDonaMediosPago } from '../components/charts.js';


function isSameSantiagoDayParts(p1, p2) {
    return p1.year === p2.year && p1.month === p2.month && p1.day === p2.day;
}

/**
 * @param {Date} d 
 * @returns {number}
 */
function getWeekNumber(d) {
    const date = new Date(d);
    const start = new Date(date.getFullYear(), 0, 1); // 1 de enero
    const days = Math.floor((date - start) / 86400000);
    // sumar start.getDay() para alinear si el año no empieza en domingo
    return Math.floor((days + start.getDay()) / 7) + 1;
}

function parseMonto(value) {
    if (value == null || value === '') return 0;
    if (typeof value === 'number') return value;

    const cleaned = String(value).replace(/\./g, '').replace(/,/g, '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
}

function parseMontoNormalizado(value) {
    let num = parseMonto(value);

    if (Number.isInteger(num) && num >= 1000 && num % 100 === 0) {
        const dividido = num / 100;
        if (dividido >= 0) {
            num = dividido;
        }
    }
    return num;
}

async function actualizarDashboard() {
    try {

        const resumen = await helpersService.getResumen();

        document.getElementById('card-total-servicios').textContent = resumen.totalServicios;
        document.getElementById('card-total-cajas').textContent = resumen.totalCajas;
        document.getElementById('card-total-usuarios').textContent = resumen.totalUsuarios;
        document.getElementById('card-total-movimientos').textContent = resumen.totalMovimientos;


        document.getElementById('card-ingresos-dia').textContent = 'CLP ' + resumen.totalGananciasHoy.TOTAL;
        document.getElementById('card-ingresos-semana').textContent = 'CLP ' + resumen.totalGananciasSemana.TOTAL;
        document.getElementById('card-ingresos-mes').textContent = 'CLP ' + resumen.totalGananciasMes.TOTAL;
        document.getElementById('card-ingresos-ano').textContent = 'CLP ' + resumen.totalGananciasAnio.TOTAL;

        // Distribución por método de pago
        const mediosPago = {
            EFECTIVO: resumen.totalGanancias.EFECTIVO || 0,
            TARJETA: resumen.totalGanancias.TARJETA || 0
        };

        console.log("Distribución por medios de pago:", mediosPago);
        renderDonaMediosPago(document.getElementById('chart-medios-pago'), mediosPago);

    } catch (err) {
        showAlert('Error al cargar resumen: ' + err.message, 'danger');
    }
}

export async function initDashboard() {
    console.log("dashboard");
    const user = getCurrentUser();
    document.getElementById('user-name').textContent = user?.username || user?.nombre || 'Usuario';

    await actualizarDashboard();
    setInterval(actualizarDashboard, 10 * 60 * 1000); // 10 min
}

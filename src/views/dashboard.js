import { getCurrentUser } from '../utils/session.js';
import { usuariosService } from '../api/usuariosService.js';
import { movimientosService } from '../api/movimientosService.js';
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


function calcularIngresosPorPeriodo(movimientos, periodo) {
    const ahora = new Date();
    const hoyParts = getSantiagoDateParts(ahora);

    return movimientos.reduce((total, mov) => {
        const movFecha = new Date(mov.fecha_creacion || mov.fecha || mov.fechaCreacion);
        const movParts = getSantiagoDateParts(movFecha);
        const monto = parseMontoNormalizado(mov.monto);

        let coincide = false;

        switch (periodo) {
            case 'dia':
                coincide = isSameSantiagoDayParts(movParts, hoyParts);
                break;

            case 'semana': {
                const semanaMov = getWeekNumber(movFecha);
                const semanaActual = getWeekNumber(ahora);
                coincide = (movParts.year === hoyParts.year) && (semanaMov === semanaActual);
                break;
            }

            case 'mes':
                coincide = (movParts.year === hoyParts.year) && (movParts.month === hoyParts.month);
                break;

            case 'ano':
                coincide = (movParts.year === hoyParts.year);
                break;
        }

        return coincide ? total + monto : total;
    }, 0);
}


async function actualizarDashboard() {
    try {
        const [usuariosResp, movimientosResp] = await Promise.all([
            usuariosService.list({ page: 1, pageSize: 10 }),
            movimientosService.list({ page: 1, pageSize: 1000 }),
        ]);

        // Totales básicos
        document.getElementById('card-total-usuarios').textContent = usuariosResp.total;
        document.getElementById('card-total-movimientos').textContent = movimientosResp.total;

        const sumaRaw = movimientosResp.data.reduce((t, m) => {
            const raw = typeof m.monto === 'string'
                ? parseFloat(String(m.monto).replace(/\./g, '').replace(/,/g, '.'))
                : m.monto;
            return t + (isNaN(raw) ? 0 : raw);
        }, 0);
        const sumaNormalizada = movimientosResp.data.reduce((t, m) => t + parseMontoNormalizado(m.monto), 0);
        console.log("Suma normalizada:", sumaNormalizada);

        // Ingresos por periodos
        const ingresosDia = calcularIngresosPorPeriodo(movimientosResp.data, 'dia');
        const ingresosSemana = calcularIngresosPorPeriodo(movimientosResp.data, 'semana');
        const ingresosMes = calcularIngresosPorPeriodo(movimientosResp.data, 'mes');
        const ingresosAno = calcularIngresosPorPeriodo(movimientosResp.data, 'ano');

        document.getElementById('card-ingresos-dia').textContent = 'CLP ' + ingresosDia.toLocaleString('es-CL');
        document.getElementById('card-ingresos-semana').textContent = 'CLP ' + ingresosSemana.toLocaleString('es-CL');
        document.getElementById('card-ingresos-mes').textContent = 'CLP ' + ingresosMes.toLocaleString('es-CL');
        document.getElementById('card-ingresos-ano').textContent = 'CLP ' + ingresosAno.toLocaleString('es-CL');

        // Distribución por método de pago
        const mediosPago = {};
        movimientosResp.data.forEach(mov => {
            const medio = mov.medio_pago || 'DESCONOCIDO';
            mediosPago[medio] = (mediosPago[medio] || 0) + parseMontoNormalizado(mov.monto);
        });

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

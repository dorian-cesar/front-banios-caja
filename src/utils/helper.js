export function formatFecha(fecha) {
    if (!fecha) return "-";

    const d = new Date(fecha);
    if (isNaN(d)) return "-";

    // Simplemente formatea la fecha UTC sin ajustes de zona horaria
    // Esto mostrará la fecha exacta que viene de la BD
    const dia = d.getUTCDate().toString().padStart(2, '0');
    const mes = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const año = d.getUTCFullYear();

    return `${dia}-${mes}-${año}`;
}

export function formatNumber(value) {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return '';
    return num.toFixed(0);
}

export function formatTimeForInput(hora) {
    return hora?.slice(0, 5) || '';
}

export function formatTimeForBackend(hora) {
    return hora ? (hora.length === 8 ? hora : `${hora}:00`) : null;
}

export function todayChile() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
}


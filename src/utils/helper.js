export function formatFecha(fecha) {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString();
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

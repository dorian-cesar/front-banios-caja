export function formatFecha(fecha) {
    if (!fecha) return "-";

    const d = new Date(fecha);
    if (isNaN(d)) return "-";

    return new Intl.DateTimeFormat("es-CL", {
        timeZone: "America/Santiago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(d);
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

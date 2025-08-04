export function debounce(fn, wait = 300) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

export function getSantiagoDateParts(dateInput) {
    const dtf = new Intl.DateTimeFormat('es-CL', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = dtf.formatToParts(new Date(dateInput));
    const obj = {};
    parts.forEach(p => {
        if (p.type === 'year') obj.year = p.value;
        if (p.type === 'month') obj.month = p.value;
        if (p.type === 'day') obj.day = p.value;
    });
    return obj;
}

export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function formatDateISOToDMY(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    if (isNaN(d)) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

export function formatTime(h) {
    if (!h) return '-';
    return h.substring(0, 5);
}

export function formatCurrencyCLP(value) {
    if (value === null || value === undefined || isNaN(value)) return '-';
    const rounded = Math.round(parseFloat(value));
    return rounded.toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    });
}
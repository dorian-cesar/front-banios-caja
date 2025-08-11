let instanciaDona = null;

export function renderDonaMediosPago(container, mediosPago) {
    if (!container) return;
    // Asegurarse de que existe Canvas
    let canvas = container.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'graficoMediosPagoCanvas';
        // limpiar placeholder y poner canvas
        container.innerHTML = '';
        container.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    const labels = Object.keys(mediosPago);
    const data = Object.values(mediosPago);

    // Colores base (rotan si hay más etiquetas)
    const baseColors = [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
    ];
    const borderColors = baseColors.map(c => c.replace(/0\.7\)$/, '1)'));

    const backgroundColor = labels.map((_, i) => baseColors[i % baseColors.length]);
    const borderColor = labels.map((_, i) => borderColors[i % borderColors.length]);

    if (instanciaDona) {
        instanciaDona.destroy();
    }

    instanciaDona = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                label: 'Medios de pago',
                data,
                backgroundColor,
                borderColor,
                borderWidth: 1,
                hoverOffset: 8,
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 10
                    }
                },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const label = ctx.label || '';
                            const value = ctx.parsed || 0;
                            return `${label}: CLP ${value.toLocaleString('es-CL')}`;
                        }
                    }
                }
            }
        }
    });
}

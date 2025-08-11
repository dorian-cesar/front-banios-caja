import { initExportModal } from '../components/exportModal.js';
import { exportToCSV } from '../utils/export.js';
import { movimientosService } from '../api/movimientosService.js';
import { helpersService } from '../api/helpersService.js';
import { showAlert } from '../components/alerts.js';
import {
    debounce,
    formatCurrencyCLP,
    formatDateISOToDMY,
    formatTime,
} from '../utils/helpers.js';

let currentPage = 1;
const pageSize = 10;
let currentSearch = '';
let exportModal;

const movimientoModal = new bootstrap.Modal(document.getElementById('movimientoModal'));

export function initMovimientosView() {

    populateFilterSelects().catch(err => showAlert('Error cargando filtros: ' + err.message, 'danger'));
    exportModal = initExportModal({
        onExport: async (filters) => {
            const res = await movimientosService.list({
                page: 1,
                pageSize: 1000,
                ...filters,
            });

            const csvData = res.data.map(m => ({
                ID: m.id || "-",
                Fecha: m.fecha ? m.fecha.split('T')[0] : "-",
                Hora: m.hora || "-",
                Usuario: m.nombre_usuario || "-",
                Servicio: m.nombre_servicio || "-",
                Caja: m.numero_caja || "-",
                Monto: m.monto || "-",
                Medio: m.medio_pago || "-",
                Código: m.codigo || "-"
            }));

            exportToCSV(csvData, 'movimientos.csv');
        },
        viewType: 'movimientos' // Especificamos el tipo de vista
    });

    document.getElementById('btn-exportar-movimientos').addEventListener('click', async () => {
        const metadata = await helpersService.getData();
        exportModal.show(metadata);
    });

    document
        .getElementById('btn-create-movimiento')
        .addEventListener('click', () => openMovimientoModal());

    document.getElementById('btn-search-movimientos').addEventListener('click', () => {
        currentPage = 1;
        loadMovimientos(currentPage);
    });

    ['filter-usuario', 'filter-caja', 'filter-servicio', 'filter-medio_pago'].forEach(id => {
        const select = document.getElementById(id);
        select.addEventListener('change', () => {
            currentPage = 1;
            loadMovimientos(currentPage);
        });
    });

    document
        .getElementById('movimientoForm')
        .addEventListener('submit', handleSaveMovimiento);

    loadMovimientos(1);
}

async function populateFilterSelects() {
    try {
        const data = await helpersService.getData();

        const usuarioFilter = document.getElementById('filter-usuario');
        usuarioFilter.innerHTML = `<option value="">Todos los usuarios</option>` +
            data.usuarios.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');

        const cajaFilter = document.getElementById('filter-caja');
        cajaFilter.innerHTML = `<option value="">Todas las cajas</option>` +
            data.cajas.map(c => `<option value="${c.numero_caja}">${c.nombre} (${c.numero_caja})</option>`).join('');

        const servicioFilter = document.getElementById('filter-servicio');
        servicioFilter.innerHTML = `<option value="">Todos los servicios</option>` +
            data.servicios.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');

        // Medio de pago fijo
        const medioPagoFilter = document.getElementById('filter-medio_pago');
        medioPagoFilter.innerHTML = `
        <option value="">Todos los medios</option>
        <option value="EFECTIVO">Efectivo</option>
        <option value="TARJETA">Tarjeta</option>
        <option value="OTRO">Otro</option>
      `;

    } catch (err) {
        showAlert('Error cargando filtros', 'danger');
    }
}

async function populateSelects() {
    // Usuarios
    try {
        const data = await helpersService.getData();

        const selectUsuarios = document.getElementById('movimiento-id_usuario');
        selectUsuarios.innerHTML = data.usuarios.map(u =>
            `<option value="${u.id}">${u.nombre}</option>`).join('');

        // Servicios
        const selectServicios = document.getElementById('movimiento-id_servicio');
        selectServicios.innerHTML = data.servicios.map(s =>
            `<option value="${s.id}">${s.nombre}</option>`).join('');

        // Cajas
        const selectCajas = document.getElementById('movimiento-numero_caja');
        selectCajas.innerHTML = data.cajas.map(c =>
            `<option value="${c.numero_caja}">${c.nombre} (${c.numero_caja})</option>`).join('');

        // medios de pago
        const selectMedioPago = document.getElementById('movimiento-medio_pago');
        if (selectMedioPago && data.mediosPago) {
            selectMedioPago.innerHTML = data.mediosPago.map(mp =>
                `<option value="${mp}">${mp}</option>`).join('');
        }

    } catch (error) {
        showAlert('No se pudieron cargar los datos', 'danger');
    }
}


let currentFilters = {
    id_usuario: '',
    numero_caja: '',
    id_servicio: '',
    medio_pago: '',
    search: ''
};

export async function loadMovimientos(page = 1) {
    currentPage = page;
    const container = document.getElementById('table-movimientos');

    currentFilters.id_usuario = document.getElementById('filter-usuario').value;
    currentFilters.numero_caja = document.getElementById('filter-caja').value;
    currentFilters.id_servicio = document.getElementById('filter-servicio').value;
    currentFilters.medio_pago = document.getElementById('filter-medio_pago').value;

    // Mantener el input búsqueda sólo para código (o texto libre)
    currentFilters.search = document.getElementById('search-movimientos').value.trim();

    try {
        const resp = await movimientosService.list({
            page: currentPage,
            pageSize,
            ...currentFilters,
        });
        let movimientos = resp.data;
        const total = resp.total;

        if (currentSearch) {
            const term = currentSearch.toLowerCase();
            movimientos = movimientos.filter(
                m =>
                    (m.codigo && m.codigo.toLowerCase().includes(term)) ||
                    (m.nombre_usuario && m.nombre_usuario.toLowerCase().includes(term)) ||
                    (m.nombre_servicio && m.nombre_servicio.toLowerCase().includes(term)) ||
                    (m.nombre_caja && m.nombre_caja.toLowerCase().includes(term))
            );
        }

        let html = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Caja</th>
            <th>Usuario / Servicio</th>
            <th>Monto / Medio</th>
            <th>Fechas</th>
            <th>Código</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

        movimientos.forEach(m => {
            html += `
        <tr data-id="${m.id}">
          <td>${m.id}</td>
          <td>
            ${m.nombre_caja}
          </td>
          <td>
            <strong>Usuario:</strong> ${m.nombre_usuario}<br>
            <small>Servicio: ${m.nombre_servicio}</small>
          </td>
          <td>
            ${formatCurrencyCLP(m.monto)}<br>
            <small>${m.medio_pago}</small>
          </td>
          <td>
            ${formatDateISOToDMY(m.fecha)} ${formatTime(m.hora)}
          </td>
          <td>${m.codigo || '-'}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-primary me-1 btn-edit" data-id="${m.id}">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${m.id}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </td>
        </tr>
      `;
        });

        if (movimientos.length === 0) {
            html += `<tr><td colspan="7" class="text-center text-muted">No hay movimientos</td></tr>`;
        }

        html += '</tbody></table>';

        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const paginationHtml = `
      <div class="d-flex justify-content-between align-items-center">
        <div><small>Mostrando página ${currentPage} de ${totalPages} — Total: ${total}</small></div>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-1" id="prev-movimiento" ${currentPage === 1 ? 'disabled' : ''}>«</button>
          <button class="btn btn-sm btn-outline-secondary" id="next-movimiento" ${currentPage === totalPages ? 'disabled' : ''}>»</button>
        </div>
      </div>
    `;

        document.getElementById('pagination-movimientos').innerHTML = paginationHtml;
        container.innerHTML = html;

        document.getElementById('prev-movimiento').addEventListener('click', () => {
            if (currentPage > 1) loadMovimientos(currentPage - 1);
        });
        document.getElementById('next-movimiento').addEventListener('click', () => {
            if (currentPage < totalPages) loadMovimientos(currentPage + 1);
        });

        container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openMovimientoModal(btn.dataset.id));
        });
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (!confirm('¿Eliminar este movimiento?')) return;
                try {
                    await movimientosService.delete(id);
                    showAlert('Movimiento eliminado', 'success');
                    loadMovimientos(currentPage);
                } catch (err) {
                    showAlert('Error eliminando movimiento: ' + err.message, 'danger');
                }
            });
        });
    } catch (err) {
        container.innerHTML = `<p class="text-danger">Error cargando movimientos: ${err.message}</p>`;
    }
}


async function handleSaveMovimiento(e) {
    e.preventDefault();
    const id = document.getElementById('movimiento-id').value;

    // Normalizar hora a HH:MM:SS si solo tiene HH:MM
    let horaInput = document.getElementById('movimiento-hora').value;
    if (/^\d{2}:\d{2}$/.test(horaInput)) {
        horaInput = horaInput + ':00';
    }

    const payload = {
        id_aperturas_cierres: parseInt(document.getElementById('movimiento-id_aperturas_cierres').value),
        id_usuario: parseInt(document.getElementById('movimiento-id_usuario').value),
        id_servicio: parseInt(document.getElementById('movimiento-id_servicio').value),
        numero_caja: parseInt(document.getElementById('movimiento-numero_caja').value),
        monto: parseFloat(document.getElementById('movimiento-monto').value),
        medio_pago: document.getElementById('movimiento-medio_pago').value,
        fecha: document.getElementById('movimiento-fecha').value,
        hora: horaInput,
        codigo: document.getElementById('movimiento-codigo').value.trim(),
    };

    if (
        !payload.id_aperturas_cierres ||
        !payload.id_usuario ||
        !payload.id_servicio ||
        !payload.numero_caja ||
        isNaN(payload.monto) ||
        !payload.medio_pago ||
        !payload.fecha ||
        !payload.hora
    ) {
        showAlert('Faltan datos obligatorios', 'warning');
        return;
    }
    if (isNaN(payload.monto) || payload.monto <= 0) {
        showAlert('Monto debe ser positivo', 'warning');
        return;
    }

    try {
        if (id) {
            await movimientosService.update(id, payload);
            showAlert('Movimiento actualizado', 'success');
        } else {
            await movimientosService.create(payload);
            showAlert('Movimiento creado', 'success');
        }
        movimientoModal.hide();
        loadMovimientos(1);
    } catch (err) {
        showAlert('Error guardando movimiento: ' + err.message, 'danger');
    }
}

async function openMovimientoModal(id = null) {
    document.getElementById('movimientoForm').reset();
    document.getElementById('movimiento-id').value = '';

    await populateSelects();
    if (id) {
        document.getElementById('movimientoModalTitle').textContent = 'Editar movimiento';
        try {
            const m = await movimientosService.get(id);
            document.getElementById('movimiento-id').value = m.id;
            document.getElementById('movimiento-id_aperturas_cierres').value = m.id_aperturas_cierres;
            document.getElementById('movimiento-id_usuario').value = m.id_usuario;
            document.getElementById('movimiento-id_servicio').value = m.id_servicio;
            document.getElementById('movimiento-numero_caja').value = m.numero_caja;
            document.getElementById('movimiento-monto').value = m.monto;
            document.getElementById('movimiento-medio_pago').value = m.medio_pago;
            document.getElementById('movimiento-fecha').value = m.fecha.split('T')[0];
            document.getElementById('movimiento-hora').value = m.hora ? formatTime(m.hora) : '';
            document.getElementById('movimiento-codigo').value = m.codigo;
        } catch (err) {
            showAlert('No se pudo cargar movimiento: ' + err.message, 'danger');
            return;
        }
    } else {
        document.getElementById('movimientoModalTitle').textContent = 'Crear movimiento';
    }
    movimientoModal.show();
}

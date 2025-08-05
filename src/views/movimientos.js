import { movimientosService } from '../api/movimientosService.js';
import { usuariosService } from '../api/usuariosService.js';
import { serviciosService } from '../api/serviciosService.js';
import { cajasService } from '../api/cajasService.js';
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

const movimientoModal = new bootstrap.Modal(document.getElementById('movimientoModal'));

export function initMovimientosView() {
    document
        .getElementById('btn-create-movimiento')
        .addEventListener('click', () => openMovimientoModal());
    document
        .getElementById('btn-search-movimientos')
        .addEventListener('click', () => {
            const input = document.getElementById('search-movimientos');
            currentSearch = input.value.trim();
            currentPage = 1;
            loadMovimientos(currentPage);
        });

    document
        .getElementById('movimientoForm')
        .addEventListener('submit', handleSaveMovimiento);

    loadMovimientos(1);
}

async function populateSelects() {
    // Usuarios
    try {
        const uResp = await usuariosService.list({ page: 1, pageSize: 100 });
        const selectU = document.getElementById('movimiento-id_usuario');
        selectU.innerHTML = uResp.data
            .map(u => `<option value="${u.id}">${u.username}</option>`)
            .join('');
    } catch {
        showAlert('No se pudieron cargar usuarios', 'warning');
    }

    // Servicios
    try {
        const sResp = await serviciosService.list({ page: 1, pageSize: 100 });
        const selectS = document.getElementById('movimiento-id_servicio');
        selectS.innerHTML = sResp.data
            .map(s => `<option value="${s.id}">${s.nombre}</option>`)
            .join('');
    } catch {
        showAlert('No se pudieron cargar servicios', 'warning');
    }

    // Cajas
    try {
        const cResp = await cajasService.list({ page: 1, pageSize: 100 });
        const selectC = document.getElementById('movimiento-numero_caja');
        selectC.innerHTML = cResp.data
            .map(c => `<option value="${c.numero_caja}">${c.nombre} (${c.numero_caja})</option>`)
            .join('');
    } catch {
        showAlert('No se pudieron cargar cajas', 'warning');
    }
}

export async function loadMovimientos(page = 1) {
    currentPage = page;
    const container = document.getElementById('table-movimientos');
    try {
        const resp = await movimientosService.list({
            page: currentPage,
            pageSize,
        });
        let movimientos = resp.data;
        const total = resp.total;

        if (currentSearch) {
            const term = currentSearch.toLowerCase();
            movimientos = movimientos.filter(
                m =>
                    (m.codigo && m.codigo.toLowerCase().includes(term)) ||
                    String(m.id_usuario).includes(term)
            );
        }

        let html = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Caja / A/C</th>
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
            Caja: ${m.numero_caja}<br>
            A/C: ${m.id_aperturas_cierres}
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

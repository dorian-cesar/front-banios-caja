import { aperturasCierresService } from '../api/aperturasCierresService.js';
import { usuariosService } from '../api/usuariosService.js';
import { cajasService } from '../api/cajasService.js';
import { showAlert } from '../components/alerts.js';
import { debounce, formatDateISOToDMY, formatTime, formatCurrencyCLP } from '../utils/helpers.js';


let currentPage = 1;
const pageSize = 10;
let currentSearch = '';
const aperturaModal = new bootstrap.Modal(document.getElementById('aperturaModal'));

async function populateAperturaCierreSelects() {
    // Cajas
    try {
        const cResp = await cajasService.list({ page: 1, pageSize: 10 });
        const selectCaja = document.getElementById('numero-caja');
        selectCaja.innerHTML = cResp.data
            .map(c => `<option value="${c.numero_caja}">${c.nombre} (${c.numero_caja})</option>`)
            .join('');
        selectCaja.insertAdjacentHTML('afterbegin', '<option value="">Selecciona caja...</option>');
    } catch {
        showAlert('No se pudieron cargar cajas', 'warning');
    }

    // Usuarios (apertura y cierre)
    try {
        const uResp = await usuariosService.list({ page: 1, pageSize: 10 });
        const usersOptions = uResp.data
            .map(u => `<option value="${u.id}">${u.username}</option>`)
            .join('');
        const selectApertura = document.getElementById('id-usuario-apertura');
        const selectCierre = document.getElementById('id-usuario-cierre');
        selectApertura.innerHTML = '<option value="">Selecciona usuario...</option>' + usersOptions;
        selectCierre.innerHTML = '<option value="">(Opcional)</option>' + usersOptions;
    } catch {
        showAlert('No se pudieron cargar usuarios', 'warning');
    }
}

export function initAperturasCierresView() {
    document.getElementById('btn-create-apertura').addEventListener('click', async () => await openAperturaModal());
    document.getElementById('btn-search-aperturas').addEventListener('click', () => {
        const input = document.getElementById('search-aperturas');
        currentSearch = input.value.trim();
        currentPage = 1;
        loadAperturasCierresPage();
    });

    document.getElementById('aperturaForm').addEventListener('submit', handleSaveAperturaCierre);
    loadAperturasCierresPage();
}


export async function loadAperturasCierresPage(page = currentPage) {
    currentPage = page;
    const container = document.getElementById('table-aperturas-cierres');

    try {
        const resp = await aperturasCierresService.list({ page: currentPage, pageSize, search: currentSearch });
        const registros = resp.data;
        const total = resp.total;

        let html = `
        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th>Caja</th>
              <th>Usuarios</th>
              <th>Fechas</th>
              <th>Monto Inicial</th>
              <th>Totales</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
      `;

        registros.forEach(r => {
            const totalGeneral = (parseFloat(r.total_efectivo || 0) + parseFloat(r.total_tarjeta || 0));
            html += `
          <tr data-id="${r.id}">
            <td>${r.numero_caja}</td>
            <td>
              <strong>A:</strong> ${r.id_usuario_apertura}<br>
              <strong>C:</strong> ${r.id_usuario_cierre || '-'}
            </td>
            <td>
              <strong>A:</strong> ${formatDateISOToDMY(r.fecha_apertura)} ${formatTime(r.hora_apertura)}<br>
              <strong>C:</strong> ${formatDateISOToDMY(r.fecha_cierre)} ${formatTime(r.hora_cierre)}
            </td>
            <td>${formatCurrencyCLP(r.monto_inicial)}</td>
            <td>
              Efectivo: ${formatCurrencyCLP(r.total_efectivo)}<br>
              Tarjeta: ${formatCurrencyCLP(r.total_tarjeta)}<br>
              <strong>Total:</strong> ${formatCurrencyCLP(totalGeneral)}
            </td>
            <td>
              <span class="badge bg-${r.estado === 'abierta' ? 'warning' : 'success'}">${r.estado}</span><br>
              <small>${r.fue_arqueada ? 'Arqueada' : 'No arqueada'}</small>
            </td>
            <td class="text-end">
                <button class="btn btn-sm btn-primary me-1 btn-edit" data-id="${r.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn btn-sm btn-danger btn-delete" data-id="${r.id}"><i class="fa-solid fa-trash-can"></i></button>
            </td>
          </tr>
        `;
        });

        if (registros.length === 0) {
            html += `<tr><td colspan="7" class="text-center text-muted">No hay registros</td></tr>`;
        }

        html += '</tbody></table>';

        // Paginación
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const paginationHtml = `
        <div class="d-flex justify-content-between align-items-center">
          <div><small>Página ${currentPage} de ${totalPages} — Total: ${total}</small></div>
          <div>
            <button class="btn btn-sm btn-outline-secondary me-1" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>«</button>
            <button class="btn btn-sm btn-outline-secondary" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>»</button>
          </div>
        </div>
      `;

        container.innerHTML = html;
        document.getElementById('pagination-aperturas-cierres').innerHTML = paginationHtml;

        // Eventos paginación
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) loadAperturasCierresPage(currentPage - 1);
        });
        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage < totalPages) loadAperturasCierresPage(currentPage + 1);
        });

        // Botones editar/borrar
        container.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => openAperturaModal(btn.dataset.id));
        });
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (!confirm('¿Seguro quieres eliminar este registro?')) return;
                try {
                    await aperturasCierresService.delete(btn.dataset.id);
                    showAlert('Registro eliminado', 'success');
                    loadAperturasCierresPage();
                } catch (err) {
                    showAlert('Error eliminando: ' + err.message, 'danger');
                }
            });
        });
    } catch (err) {
        container.innerHTML = `<p class="text-danger">Error cargando datos: ${err.message}</p>`;
    }
}


async function openAperturaModal(id = null) {
    const form = document.getElementById('aperturaForm');
    form.reset();
    document.getElementById('apertura-id').value = '';
    document.getElementById('aperturaModalTitle').textContent = id ? 'Editar Apertura/Cierre' : 'Nueva Apertura/Cierre';

    await populateAperturaCierreSelects();

    if (id) {
        try {
            const registro = await aperturasCierresService.get(id);
            document.getElementById('apertura-id').value = registro.id;
            document.getElementById('numero-caja').value = registro.numero_caja;
            document.getElementById('id-usuario-apertura').value = registro.id_usuario_apertura;
            document.getElementById('fecha-apertura').value = registro.fecha_apertura;
            document.getElementById('hora-apertura').value = registro.hora_apertura;
            document.getElementById('monto-inicial').value = registro.monto_inicial;
            document.getElementById('estado').value = registro.estado;
            document.getElementById('observaciones').value = registro.observaciones || '';
            document.getElementById('id-usuario-cierre').value = registro.id_usuario_cierre || '';
            document.getElementById('fecha-cierre').value = registro.fecha_cierre || '';
            document.getElementById('hora-cierre').value = registro.hora_cierre || '';
            document.getElementById('total-efectivo').value = registro.total_efectivo || '';
            document.getElementById('total-tarjeta').value = registro.total_tarjeta || '';
            document.getElementById('estado').value = registro.estado;
            document.getElementById('fue-arqueada').checked = Boolean(registro.fue_arqueada);

        } catch (err) {
            showAlert('Error cargando registro: ' + err.message, 'danger');
            return;
        }
    }

    aperturaModal.show();
}

async function handleSaveAperturaCierre(e) {
    e.preventDefault();
    const id = document.getElementById('apertura-id').value;
    const numero_caja = +document.getElementById('numero-caja').value;
    const id_usuario_apertura = +document.getElementById('id-usuario-apertura').value;
    const fecha_apertura = document.getElementById('fecha-apertura').value;
    const hora_apertura = document.getElementById('hora-apertura').value;
    const monto_inicial = parseFloat(document.getElementById('monto-inicial').value);
    const estado = document.getElementById('estado').value;
    const observaciones = document.getElementById('observaciones').value.trim();
    const id_usuario_cierre = +document.getElementById('id-usuario-cierre').value || null;
    const fecha_cierre = document.getElementById('fecha-cierre').value || null;
    const hora_cierre = document.getElementById('hora-cierre').value || null;
    const total_efectivo = parseFloat(document.getElementById('total-efectivo').value) || 0;
    const total_tarjeta = parseFloat(document.getElementById('total-tarjeta').value) || 0;
    const fue_arqueada = document.getElementById('fue-arqueada').checked ? 1 : 0;

    if (estado === 'cerrada') {
        if (!id_usuario_cierre || !fecha_cierre || !hora_cierre) {
            showAlert('Para cerrar debe completar usuario de cierre, fecha y hora de cierre', 'warning');
            return;
        }
    }

    if (!numero_caja || !id_usuario_apertura || !fecha_apertura || !hora_apertura || isNaN(monto_inicial)) {
        showAlert('Por favor, completa todos los campos obligatorios', 'warning');
        return;
    }

    const payload = {
        numero_caja,
        id_usuario_apertura,
        id_usuario_cierre,
        fecha_apertura,
        hora_apertura,
        fecha_cierre,
        hora_cierre,
        monto_inicial,
        total_efectivo,
        total_tarjeta,
        observaciones: observaciones || null,
        estado,
        fue_arqueada,
    };

    try {
        if (id) {
            await aperturasCierresService.update(id, payload);
            showAlert('Registro actualizado', 'success');
        } else {
            // Para creación faltan id_usuario_cierre, fecha_cierre, etc. que pueden ir como null o default
            await aperturasCierresService.create(payload);
            showAlert('Registro creado', 'success');
        }
        aperturaModal.hide();
        loadAperturasCierresPage(1);
    } catch (err) {
        showAlert('Error guardando registro: ' + err.message, 'danger');
    }
}

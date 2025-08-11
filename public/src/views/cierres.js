import { aperturasCierresService } from '../api/aperturasCierresService.js';
import { helpersService } from '../api/helpersService.js';
import { showAlert } from '../components/alerts.js';
import { debounce, formatDateISOToDMY, formatTime, formatCurrencyCLP } from '../utils/helpers.js';
import { initExportModal } from '../components/exportModal.js';
import { exportToCSV } from '../utils/export.js';

let currentPage = 1;
const pageSize = 10;
let currentSearch = '';
let exportModal;
const aperturaModal = new bootstrap.Modal(document.getElementById('aperturaModal'));

async function populateAperturaFormSelects() {
    try {
        const data = await helpersService.getData({ page: 1, pageSize: 100 });

        const usuarioAperturaSelect = document.getElementById('id-usuario-apertura');
        const usuarioCierreSelect = document.getElementById('id-usuario-cierre');
        const cajaSelect = document.getElementById('numero-caja');

        // Limpiar selects antes de volver a cargar
        [usuarioAperturaSelect, usuarioCierreSelect, cajaSelect].forEach(select => {
            while (select.options.length > 1) {
                select.remove(1);
            }
        });

        // Cargar usuarios
        data.usuarios.forEach(u => {
            const option = `<option value="${u.id}">${u.nombre}</option>`;
            usuarioAperturaSelect.insertAdjacentHTML('beforeend', option);
            usuarioCierreSelect.insertAdjacentHTML('beforeend', option);
        });

        // Cargar cajas
        data.cajas.forEach(c => {
            const option = `<option value="${c.numero_caja}">${c.nombre} (${c.numero_caja})</option>`;
            cajaSelect.insertAdjacentHTML('beforeend', option);
        });

    } catch (err) {
        console.error('Error cargando selects del modal de creación:', err);
    }
}


export function initAperturasCierresView() {

    populateFilterSelects().catch(err => showAlert('Error cargando filtros: ' + err.message, 'danger'));

    exportModal = initExportModal({
        onExport: async (filters) => {
            const res = await aperturasCierresService.list({
                page: 1,
                pageSize: 1000,
                ...filters,
            });

            const csvData = res.data.map(a => ({
                ID: a.id || "-",
                Caja: a.numero_caja || "-",
                UsuarioApertura: a.nombre_usuario_apertura || "-",
                UsuarioCierre: a.nombre_usuario_cierre || "-",
                FechaApertura: a.fecha_apertura ? a.fecha_apertura.split('T')[0] : "-",
                HoraApertura: a.hora_apertura || "-",
                FechaCierre: a.fecha_cierre ? a.fecha_cierre.split('T')[0] : "-",
                HoraCierre: a.hora_cierre || "-",
                MontoInicial: a.monto_inicial || "-",
                Efectivo: a.total_efectivo || "-",
                Tarjeta: a.total_tarjeta || "-",
                Observaciones: a.observaciones || "-",
                Estado: a.estado || "-"
            }));

            exportToCSV(csvData, 'AperturasCierres.csv');
        },
        viewType: 'cierres' // Especificamos el tipo de vista
    });

    document.getElementById('btn-export-aperturas').addEventListener('click', async () => {
        const metadata = await helpersService.getData();
        exportModal.show(metadata);
    });

    document.getElementById('btn-create-apertura').addEventListener('click', async () => await openAperturaModal());

    document.getElementById('btn-search-aperturas').addEventListener('click', () => {
        currentPage = 1;
        loadAperturasCierresPage();
    });

    ['filter-usuario-cierre', 'filter-fecha-apertura', 'filter-fecha-cierre', 'filter-estado']
        .forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                currentPage = 1;
                loadAperturasCierresPage();
            });
        });


    document.getElementById('aperturaForm').addEventListener('submit', handleSaveAperturaCierre);
    loadAperturasCierresPage();
}


export async function loadAperturasCierresPage(page = currentPage) {
    currentPage = page;
    const container = document.getElementById('table-aperturas-cierres');

    try {
        const filters = getAperturasFilters();
        const resp = await aperturasCierresService.list({
            page: currentPage,
            pageSize,
            ...filters
        });

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
            <td>${r.nombre_caja}</td>
            <td>
              <strong>A:</strong> ${r.nombre_usuario_apertura}<br>
              <strong>C:</strong> ${r.nombre_usuario_cierre || '-'}
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

    await populateAperturaFormSelects();

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

function setupExportModal() {
    // Eliminar modal existente si hay uno
    const existingModal = document.getElementById('modalExportar');
    if (existingModal) {
        existingModal.remove();
    }

    // Crear nuevo modal
    createExportModal();

    const modalElement = document.getElementById('modalExportar');
    const modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: true,
        keyboard: true
    });

    // Configurar el botón de exportación
    document.getElementById('btn-export-aperturas').addEventListener('click', async () => {
        await populateExportFilters();
        modalInstance.show();
    });

    document.addEventListener('submit', async (e) => {
        if (e.target.id !== 'formExportar') return;
        e.preventDefault();

        const data = new FormData(e.target);
        const filters = Object.fromEntries(data.entries());

        try {
            const res = await aperturasCierresService.list({
                page: 1,
                pageSize: 1000,
                ...filters,
            });

            const csvData = res.data.map(a => ({
                ID: a.id,
                Caja: a.nombre_caja,
                UsuarioApertura: a.nombre_usuario_apertura,
                UsuarioCierre: a.nombre_usuario_cierre,
                FechaApertura: a.fecha_apertura.split('T')[0],
                HoraApertura: a.hora_apertura,
                FechaCierre: a.fecha_cierre,
                HoraCierre: a.hora_cierre,
                MontoInicial: a.monto_inicial,
                Efectivo: a.total_efectivo,
                Tarjeta: a.total_tarjeta,
                Observaciones: a.observaciones || "-",
                Estado: a.estado
            }));

            exportToCSV(csvData, 'AperturasCierres.csv');

            // Cerrar el modal usando la instancia existente
            if (modalInstance) {
                modalInstance.hide();

                // Limpiar el backdrop manualmente si es necesario
                const backdrops = document.querySelectorAll('.modal-backdrop');
                if (backdrops.length > 1) {
                    backdrops.forEach(backdrop => backdrop.remove());
                }
            }
        } catch (err) {
            showAlert('Error al exportar: ' + err.message, 'danger');
        }
    });
}
async function populateExportFilters() {
    const usuarioSelect = document.getElementById('filtroUsuario');
    const cajaSelect = document.getElementById('filtroCaja');

    usuarioSelect.innerHTML = `<option value="">Todos</option>`;
    cajaSelect.innerHTML = `<option value="">Todas</option>`;

    try {
        const metadata = await helpersService.getData();

        // Usuarios
        metadata.usuarios.forEach(usuario => {
            usuarioSelect.innerHTML += `<option value="${usuario.id}">${usuario.nombre}</option>`;
        });

        // Cajas
        metadata.cajas.forEach(caja => {
            cajaSelect.innerHTML += `<option value="${caja.numero_caja}">${caja.nombre} (${caja.numero_caja})</option>`;
        });

    } catch (err) {
        console.error(err);
        showAlert('Error cargando filtros de exportación', 'warning');
    }
}


function getAperturasFilters() {
    return {
        search: document.getElementById('search-aperturas').value.trim(),
        id_usuario: document.getElementById('filter-usuario-cierre').value || '',
        fecha_inicio: document.getElementById('filter-fecha-apertura').value || '',
        fecha_fin: document.getElementById('filter-fecha-cierre').value || '',
        estado: document.getElementById('filter-estado').value || ''
    };
}


async function populateFilterSelects() {
    try {
        const data = await helpersService.getData();

        const usuarioFilter = document.getElementById('filter-usuario-cierre');
        usuarioFilter.innerHTML = `<option value="">Todos los usuarios</option>` +
            data.usuarios.map(u => `<option value="${u.id}">${u.nombre}</option>`).join('');

        const medioPagoFilter = document.getElementById('filter-estado');
        medioPagoFilter.innerHTML = `
            <option value="">Todos los estados</option>
            <option value="ABIERTA">Abierta</option>
            <option value="CERRADA">Cerrada</option>
      `;

    } catch (err) {
        showAlert('Error cargando filtros', 'danger');
    }
}
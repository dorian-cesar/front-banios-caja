import { cajasService } from '../api/cajasService.js';
import { showAlert } from '../components/alerts.js';
import { debounce } from '../utils/helpers.js';
import { exportToCSV } from '../utils/export.js';

let currentPage = 1;
const pageSize = 10;
let currentSearch = '';

const cajaModal = new bootstrap.Modal(document.getElementById('cajaModal'));


export function initCajasView() {
    document.getElementById('btn-create-caja').addEventListener('click', () => openCajaModal());
    document.getElementById('btn-export-cajas').addEventListener('click', () => exportCajas());
    document.getElementById('btn-search-cajas').addEventListener('click', () => {
        const input = document.getElementById('search-cajas');
        currentSearch = input.value.trim();
        currentPage = 1;
        loadCajasPage();
    });

    document.getElementById('cajaForm').addEventListener('submit', handleSaveCaja);

    loadCajasPage();
}

export async function loadCajasPage(page = currentPage) {
    currentPage = page;
    const container = document.getElementById('table-cajas');

    try {
        const resp = await cajasService.list({
            page: currentPage,
            pageSize,
            search: currentSearch,
        });

        let cajas = resp.data;
        const total = resp.total;

        let html = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Número</th>
                    <th>Nombre</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Descripción</th>
                    <th class="text-end">Acciones</th>
                </tr>
            </thead>
            <tbody>
        `;

        cajas.forEach(c => {
            html += `
            <tr>
                <td>${c.id}</td>
                <td>${c.numero_caja}</td>
                <td>${c.nombre}</td>
                <td>${c.ubicacion || '-'}</td>
                <td>${c.estado}</td>
                <td>${c.descripcion || '-'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-primary me-1 btn-edit" data-id="${c.id}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn btn-sm btn-danger btn-delete" data-id="${c.id}"><i class="fa-solid fa-trash-can"></i></button>
                </td>
            </tr>
            `;
        });

        if (cajas.length === 0) {
            html += `<tr><td colspan="7" class="text-center text-muted">No hay cajas</td></tr>`;
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

        document.getElementById('pagination-cajas').innerHTML = paginationHtml;
        container.innerHTML = html;

        // Eventos paginación
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) loadCajasPage(currentPage - 1);
        });
        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage < totalPages) loadCajasPage(currentPage + 1);
        });

        // Botones editar y eliminar
        container.querySelectorAll('.btn-edit').forEach(b => {
            b.addEventListener('click', () => openCajaModal(b.dataset.id));
        });
        container.querySelectorAll('.btn-delete').forEach(b => {
            b.addEventListener('click', async () => {
                if (!confirm('¿Seguro quieres eliminar esta caja?')) return;
                try {
                    await cajasService.delete(b.dataset.id);
                    showAlert('Caja eliminada correctamente', 'success');
                    loadCajasPage();
                } catch (err) {
                    showAlert('Error eliminando: ' + err.message, 'danger');
                }
            });
        });

    } catch (error) {
        container.innerHTML = `<p class="text-danger">Error cargando cajas: ${error.message}</p>`;
    }
}

async function handleSaveCaja(e) {
    e.preventDefault();

    const id = document.getElementById('caja-id').value;
    const numero_caja = document.getElementById('caja-numero').value.trim();
    const nombre = document.getElementById('caja-nombre').value.trim();
    const ubicacion = document.getElementById('caja-ubicacion').value.trim() || null;
    const estado = document.getElementById('caja-estado').value;
    const descripcion = document.getElementById('caja-descripcion').value.trim() || null;

    if (!numero_caja || !nombre) {
        showAlert('Número y nombre son obligatorios', 'warning');
        return;
    }

    const payload = { numero_caja, nombre, ubicacion, estado, descripcion };

    try {
        if (id) {
            await cajasService.update(id, payload);
            showAlert('Caja actualizada correctamente', 'success');
        } else {
            await cajasService.create(payload);
            showAlert('Caja creada correctamente', 'success');
        }
        cajaModal.hide();
        loadCajasPage();
    } catch (err) {
        showAlert('Error guardando caja: ' + err.message, 'danger');
    }
}

async function openCajaModal(id = null) {
    document.getElementById('cajaForm').reset();
    document.getElementById('caja-id').value = '';

    if (id) {
        document.getElementById('cajaModalTitle').textContent = 'Editar caja';
        try {
            const caja = await cajasService.get(id);
            document.getElementById('caja-id').value = caja.id;
            document.getElementById('caja-numero').value = caja.numero_caja;
            document.getElementById('caja-nombre').value = caja.nombre;
            document.getElementById('caja-ubicacion').value = caja.ubicacion || '';
            document.getElementById('caja-estado').value = caja.estado;
            document.getElementById('caja-descripcion').value = caja.descripcion || '';
        } catch (err) {
            showAlert('No se pudo cargar caja: ' + err.message, 'danger');
            return;
        }
    } else {
        document.getElementById('cajaModalTitle').textContent = 'Crear caja';
    }

    cajaModal.show();
}

async function exportCajas() {

    try {
        const res = await cajasService.list({
            page: 1,
            pageSize: 10,
            search: ''
        });

        const cajas = res.data;

        const csvData = cajas.map(c => ({
            Número: c.numero_caja,
            Nombre: c.nombre,
            Ubicación: c.ubicacion,
            Estado: c.estado
        }));

        exportToCSV(csvData, 'cajas.csv');
    } catch (err) {
        showAlert('Error exprotando cajas: ' + err.message, 'danger');
    }

}
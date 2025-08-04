import { serviciosService } from '../api/serviciosService.js';
import { showAlert } from '../components/alerts.js';
import { debounce, formatCurrencyCLP } from '../utils/helpers.js';

let currentPage = 1;
const pageSize = 10;
let currentSearch = '';

const servicioModal = new bootstrap.Modal(document.getElementById('servicioModal'));

export function initServiciosView() {
  document
    .getElementById('btn-create-servicio')
    .addEventListener('click', () => openServicioModal());

  document
    .getElementById('btn-search-servicios')
    .addEventListener('click', () => {
      currentSearch = document.getElementById('search-servicios').value.trim();
      currentPage = 1;
      loadServicios(1);
    });

  document
    .getElementById('servicioForm')
    .addEventListener('submit', handleSaveServicio);

  loadServicios(1);
}

export async function loadServicios(page = 1) {
  currentPage = page;
  const container = document.getElementById('table-servicios');
  try {
    const resp = await serviciosService.list({
      page: currentPage,
      pageSize,
      search: currentSearch,
    });
    const servicios = resp.data;
    const total = resp.total;

    let html = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Precio</th>
            <th>Estado</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    servicios.forEach(s => {
      const tipoCapitalizado =
        s.tipo && typeof s.tipo === 'string'
          ? s.tipo.charAt(0).toUpperCase() + s.tipo.slice(1)
          : '';
      html += `
        <tr data-id="${s.id}">
          <td>${s.id}</td>
          <td>${s.nombre}</td>
          <td>${tipoCapitalizado}</td>
          <td>${formatCurrencyCLP(s.precio)}</td>
          <td>${s.estado}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-1 btn-edit" data-id="${s.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${s.id}">Borrar</button>
          </td>
        </tr>
      `;
    });

    if (servicios.length === 0) {
      html += `<tr><td colspan="6" class="text-center text-muted">No hay servicios</td></tr>`;
    }

    html += '</tbody></table>';

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paginationHtml = `
      <div class="d-flex justify-content-between align-items-center">
        <div><small>Mostrando página ${currentPage} de ${totalPages} — Total: ${total}</small></div>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-1" id="prev-servicio" ${currentPage === 1 ? 'disabled' : ''
      }>«</button>
          <button class="btn btn-sm btn-outline-secondary" id="next-servicio" ${currentPage === totalPages ? 'disabled' : ''
      }>»</button>
        </div>
      </div>
    `;

    document.getElementById('pagination-servicios').innerHTML = paginationHtml;
    container.innerHTML = html;

    document
      .getElementById('prev-servicio')
      .addEventListener('click', () => {
        if (currentPage > 1) loadServicios(currentPage - 1);
      });
    document
      .getElementById('next-servicio')
      .addEventListener('click', () => {
        if (currentPage < totalPages) loadServicios(currentPage + 1);
      });

    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => openServicioModal(btn.dataset.id));
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('¿Eliminar este servicio?')) return;
        try {
          await serviciosService.delete(id);
          showAlert('Servicio eliminado', 'success');
          loadServicios(currentPage);
        } catch (err) {
          showAlert('Error eliminando servicio: ' + err.message, 'danger');
        }
      });
    });
  } catch (err) {
    container.innerHTML = `<p class="text-danger">Error cargando servicios: ${err.message}</p>`;
  }
}

async function poblarSelectTipos() {
  try {
    const tipos = await serviciosService.getTipos();
    const select = document.getElementById('servicio-tipo');
    select.innerHTML = `<option value="">-- Seleccionar tipo --</option>`;
    tipos.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando tipos:', err);
    document.getElementById('servicio-tipo').innerHTML = `<option value="">(no se pudieron cargar)</option>`;
  }
}

async function handleSaveServicio(e) {
  e.preventDefault();
  const id = document.getElementById('servicio-id').value;
  const nombre = document.getElementById('servicio-nombre').value.trim();
  const tipo = document.getElementById('servicio-tipo').value.trim();
  const precio = parseFloat(document.getElementById('servicio-precio').value);
  const descripcion = document.getElementById('servicio-descripcion').value.trim();
  const estado = document.getElementById('servicio-estado').value;

  if (!nombre || !tipo || isNaN(precio)) {
    showAlert('Nombre, tipo y precio son obligatorios', 'warning');
    return;
  }

  if (descripcion.length > 200) {
    showAlert('La descripción no puede tener más de 200 caracteres', 'warning');
    return;
  }

  const payload = { nombre, tipo, precio, descripcion, estado };

  try {
    if (id) {
      await serviciosService.update(id, payload);
      showAlert('Servicio actualizado', 'success');
    } else {
      await serviciosService.create(payload);
      showAlert('Servicio creado', 'success');
    }
    servicioModal.hide();
    loadServicios(1);
  } catch (err) {
    showAlert('Error guardando servicio: ' + err.message, 'danger');
  }
}

async function openServicioModal(id = null) {
  document.getElementById('servicioForm').reset();
  document.getElementById('servicio-id').value = '';

  await poblarSelectTipos();

  if (id) {
    document.getElementById('servicioModalTitle').textContent = 'Editar servicio';
    try {
      const s = await serviciosService.get(id);
      document.getElementById('servicio-id').value = s.id;
      document.getElementById('servicio-nombre').value = s.nombre;
      document.getElementById('servicio-tipo').value = s.tipo;
      document.getElementById('servicio-precio').value = s.precio;
      document.getElementById('servicio-descripcion').value = s.descripcion || '';
      document.getElementById('servicio-estado').value = s.estado || 'activo';
    } catch (err) {
      showAlert('No se pudo cargar servicio: ' + err.message, 'danger');
      return;
    }
  } else {
    document.getElementById('servicioModalTitle').textContent = 'Crear servicio';
  }
  servicioModal.show();
}

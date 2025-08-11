import { usuariosService } from '../api/usuariosService.js';
import { showAlert } from '../components/alerts.js';
import { debounce, isValidEmail } from '../utils/helpers.js'
import { exportToCSV } from '../utils/export.js';

let currentPage = 1;
const pageSize = 10;
let currentSearch = '';

const userModal = new bootstrap.Modal(document.getElementById('userModal'));

export function initUsuariosView() {
    document.getElementById('btn-create-user').addEventListener('click', () => openUserModal());
    document.getElementById('btn-export-users').addEventListener('click', () => exportUsuarios());

    document.getElementById('btn-search-users').addEventListener('click', () => {
        currentSearch = document.getElementById('search-users').value.trim();
        currentPage = 1;
        loadUsuariosPage();
    });

    document.getElementById('userForm').addEventListener('submit', handleSaveUser);

    loadUsuariosPage();
}

export async function loadUsuariosPage(page = currentPage) {
    console.log("usuarios")
    currentPage = page;
    const container = document.getElementById('table-usuarios');
    try {
        const resp = await usuariosService.list({
            page: currentPage,
            pageSize,
            search: currentSearch,
        });
        const usuarios = resp.data;
        const total = resp.total;

        // Construir tabla
        let html = `
      <table class="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th class="text-end">Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

        usuarios.forEach(u => {
            html += `
        <tr data-id="${u.id}">
          <td>${u.id}</td>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-primary me-1 btn-edit" data-id="${u.id}"><i class="fa-solid fa-pen-to-square"></i></button>
            <button class="btn btn-sm btn-danger btn-delete" data-id="${u.id}"><i class="fa-solid fa-trash-can"></i></button>
          </td>
        </tr>
      `;
        });

        if (usuarios.length === 0) {
            html += `<tr><td colspan="5" class="text-center text-muted">No hay usuarios</td></tr>`;
        }

        html += '</tbody></table>';

        // Paginación simple
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        let paginationHtml = `
      <div class="d-flex justify-content-between align-items-center">
        <div><small>Mostrando página ${currentPage} de ${totalPages} — Total: ${total}</small></div>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-1" id="prev-page" ${currentPage === 1 ? 'disabled' : ''}>«</button>
          <button class="btn btn-sm btn-outline-secondary" id="next-page" ${currentPage === totalPages ? 'disabled' : ''}>»</button>
        </div>
      </div>
    `;

        document.getElementById('pagination-usuarios').innerHTML = paginationHtml;
        container.innerHTML = html;

        // Eventos paginación
        document.getElementById('prev-page').addEventListener('click', () => {
            if (currentPage > 1) loadUsuariosPage(currentPage - 1);
        });
        document.getElementById('next-page').addEventListener('click', () => {
            if (currentPage < totalPages) loadUsuariosPage(currentPage + 1);
        });

        // Delegación botones editar / borrar
        container.querySelectorAll('.btn-edit').forEach(b => {
            b.addEventListener('click', async () => {
                const id = b.dataset.id;
                openUserModal(id);
            });
        });
        container.querySelectorAll('.btn-delete').forEach(b => {
            b.addEventListener('click', async () => {
                const id = b.dataset.id;
                if (!confirm('¿Seguro quieres eliminar este usuario?')) return;
                try {
                    await usuariosService.delete(id);
                    showAlert('Usuario eliminado', 'success');
                    loadUsuariosPage(); // recarga
                } catch (err) {
                    showAlert('Error eliminando: ' + err.message, 'danger');
                }
            });
        });
    } catch (error) {
        container.innerHTML = `<p class="text-danger">Error cargando usuarios: ${error.message}</p>`;
    }
}

async function loadRoles() {
    try {
        const roles = await usuariosService.getRoles();
        const select = document.getElementById('user-role');
        select.innerHTML = '';
        roles.forEach(role => {
            const opt = document.createElement('option');
            opt.value = role;
            opt.textContent = role.charAt(0).toUpperCase() + role.slice(1);
            select.appendChild(opt);
        });
    } catch (err) {
        showAlert('Error cargando roles: ' + err.message, 'danger');
    }
}


async function handleSaveUser(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const username = document.getElementById('user-username').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const role = document.getElementById('user-role').value;
    const password = document.getElementById('user-password').value;

    if (!username || !email || !role) {
        showAlert('Usuario, email y rol son obligatorios', 'warning');
        return;
    }

    if (!isValidEmail(email)) {
        showAlert('Email inválido', 'warning');
        return;
    }
    const allowedRoles = ['admin', 'cajero'];
    if (!allowedRoles.includes(role.toLowerCase())) {
        showAlert('Rol inválido', 'warning');
        return;
    }
    if (!id && (!password || password.length < 6)) {
        showAlert('Contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }
    if (id && password && password.length < 6) {
        showAlert('Si cambias la contraseña, debe tener al menos 6 caracteres', 'warning');
        return;
    }
    const payload = { username, email, role };
    if (password) payload.password = password; // solo si se puso

    try {
        if (id) {
            await usuariosService.update(id, payload);
            showAlert('Usuario actualizado', 'success');
        } else {
            await usuariosService.create(payload);
            showAlert('Usuario creado', 'success');
        }
        userModal.hide();
        loadUsuariosPage(1);
    } catch (err) {
        showAlert('Error guardando usuario: ' + err.message, 'danger');
    }
}

async function openUserModal(id = null) {
    console.log("Edit user id:", id);
    document.getElementById('userForm').reset();
    document.getElementById('user-password').value = '';
    document.getElementById('user-id').value = '';
    document.getElementById('password-hint').textContent = id ? '(solo si la cambias)' : '';

    if (id) {
        // edición: cargar datos
        document.getElementById('userModalTitle').textContent = 'Editar usuario';
        try {
            const user = await usuariosService.get(id);
            document.getElementById('user-id').value = user.id;
            document.getElementById('user-username').value = user.username;
            document.getElementById('user-email').value = user.email;
            await loadRoles();
            document.getElementById('user-role').value = user.role.toLowerCase();

        } catch (err) {
            showAlert('No se pudo cargar usuario: ' + err.message, 'danger');
            return;
        }
    } else {
        document.getElementById('userModalTitle').textContent = 'Crear usuario';
    }

    userModal.show();
}

async function exportUsuarios() {
    try {
        const resp = await usuariosService.list({
            page: 1,
            pageSize: 100,
            search: ''
        });

        const usuarios = resp.data;

        const csvData = usuarios.map(u => ({
            ID: u.id,
            Usuario: u.username,
            Email: u.email,
            Rol: u.role
        }));

        exportToCSV(csvData, 'usuarios.csv');
    } catch (err) {
        showAlert('Error exportando usuarios: ' + err.message, 'danger');
    }
}
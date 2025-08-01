import { initDashboard } from './views/dashboard.js';
import { loadUsuariosPage } from './views/usuarios.js';
import { loadServicios } from './views/servicios.js';
import { loadMovimientos } from './views/movimientos.js';
import { getCurrentUser, clearSession, getToken } from './utils/session.js';

document.addEventListener('DOMContentLoaded', () => {
  // Si no hay sesión activa, redirige al login
  if (!getToken()) {
    window.location.href = './login.html';
    return;
  }

  // Mostrar nombre de usuario en navbar (si lo hace dashboard, puedes omitirlo aquí)
  // const user = getCurrentUser();
  // document.getElementById('user-name').textContent = user?.username || user?.nombre || 'Usuario';

  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const views = document.querySelectorAll('.view');

  // Función para cambiar vista y cargar su data
  function activateView(viewId) {
    // Ocultar todas
    views.forEach(v => v.classList.remove('active'));
    // Mostrar la solicitada
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    // Cargar datos contextuales
    switch (viewId) {
      case 'dashboard-view':
        initDashboard();
        break;
      case 'usuarios-view':
        loadUsuariosPage();
        break;
      case 'servicios-view':
        loadServicios();
        break;
      case 'movimientos-view':
        loadMovimientos();
        break;
    }
  }

  // Enlazar clicks
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetViewId = link.dataset.view;
      activateView(targetViewId);
    });
  });

  // Cargar vista inicial (la que tenga .active en el HTML o dashboard por defecto)
  const initial = document.querySelector('.view.active');
  if (initial) {
    activateView(initial.id);
  } else {
    activateView('dashboard-view');
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    window.location.href = './login.html';
  });
});

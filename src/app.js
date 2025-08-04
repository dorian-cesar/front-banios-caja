import { initDashboard } from './views/dashboard.js';
import { initUsuariosView } from './views/usuarios.js';
import { initServiciosView } from './views/servicios.js';
import { initMovimientosView } from './views/movimientos.js';
import { initCajasView } from './views/cajas.js';
import { initAperturasCierresView } from './views/cierres.js'
import { getCurrentUser, clearSession, getToken } from './utils/session.js';

document.addEventListener('DOMContentLoaded', () => {

  if (!getToken()) {
    window.location.href = './index.html';
    return;
  }

  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const views = document.querySelectorAll('.view');

  function activateView(viewId) {
    views.forEach(v => v.classList.remove('active'));

    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    switch (viewId) {
      case 'dashboard-view':
        initDashboard();
        break;
      case 'usuarios-view':
        initUsuariosView();
        break;
      case 'servicios-view':
        initServiciosView();
        break;
      case 'movimientos-view':
        initMovimientosView();
        break;
      case 'cajas-view':
        initCajasView();
        break;
      case 'cierres-view':
        initAperturasCierresView();
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

  const initial = document.querySelector('.view.active');
  if (initial) {
    activateView(initial.id);
  } else {
    activateView('dashboard-view');
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    window.location.href = './index.html';
  });
});

import { initDashboard } from './views/dashboard.js';
import { initUsuariosView } from './views/usuarios.js';
import { initServiciosView } from './views/servicios.js';
import { initMovimientosView } from './views/movimientos.js';
import { initCajasView } from './views/cajas.js';
import { initAperturasCierresView } from './views/cierres.js'
import { getCurrentUser, clearSession, getToken, isTokenExpired } from './utils/session.js';

document.addEventListener('DOMContentLoaded', async () => {

  if (!getToken() || isTokenExpired()) {
    clearSession();
    alert("Sesión expirada, inicia sesión nuevamente.")
    window.location.href = './index.html';
    return;
  }

  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');

  // Aplicar tema inicial
  document.body.classList.toggle('dark-theme', savedTheme === 'dark');
  themeToggle.checked = savedTheme === 'dark';
  updateThemeIcons(savedTheme === 'dark');

  themeToggle.addEventListener('change', function () {
    const isDark = this.checked;
    document.body.classList.toggle('dark-theme', isDark);
    updateThemeIcons(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  });

  function updateThemeIcons(isDark) {
    const sunIcon = document.querySelector('.fa-sun');
    const moonIcon = document.querySelector('.fa-moon');

    if (isDark) {
      sunIcon.classList.replace('fa-regular', 'fa-solid');
      moonIcon.classList.replace('fa-solid', 'fa-regular');
    } else {
      sunIcon.classList.replace('fa-solid', 'fa-regular');
      moonIcon.classList.replace('fa-regular', 'fa-solid');
    }
  }



  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const views = document.querySelectorAll('.view');



  async function activateView(viewId) {

    if (!getToken() || isTokenExpired()) {
      clearSession();
      alert("Sesión expirada, inicia sesión nuevamente.");
      window.location.href = './index.html';
      return;
    }

    console.log("sesion autorizada")

    views.forEach(v => v.classList.remove('active'));

    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');

    switch (viewId) {
      case 'dashboard-view':
        await initDashboard();
        break;
      case 'usuarios-view':
        await initUsuariosView();
        break;
      case 'servicios-view':
        await initServiciosView();
        break;
      case 'movimientos-view':
        await initMovimientosView();
        break;
      case 'cajas-view':
        await initCajasView();
        break;
      case 'cierres-view':
        await initAperturasCierresView();
        break;
    }
  }

  // Enlazar clicks
  sidebarLinks.forEach(link => {
    link.addEventListener('click', async () => {
      const targetViewId = link.dataset.view;
      await activateView(targetViewId);
    });
  });

  const initial = document.querySelector('.view.active');
  if (initial) {
    await activateView(initial.id);
  } else {
    await activateView('dashboard-view');
  }

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    clearSession();
    window.location.href = './index.html';
  });
});

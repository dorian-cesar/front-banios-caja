import { authService } from '../api/authService.js';
import { saveSession, getToken } from '../utils/session.js';

if (getToken()) {
    // Si ya está logueado, redirigir
    window.location.href = './dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('loginForm');
    const alertContainer = document.getElementById('alert-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        alertContainer.innerHTML = '';

        const email = form.email.value.trim();
        const password = form.password.value.trim();
        if (!email || !password) {
            showAlert('Completa todos los campos', 'warning');
            return;
        }

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        try {
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Verificando...`;

            const { token, user } = await authService.login(email, password);
            saveSession(token, user);

            window.location.href = './dashboard.html';
        } catch (err) {
            showAlert(err.message || 'Error en login', 'danger');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    function showAlert(message, type = 'danger') {
        alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
    }
});

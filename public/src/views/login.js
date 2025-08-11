import { authService } from '../api/authService.js';
import { saveSession, getToken, isTokenExpired } from '../utils/session.js';

if (getToken() && !isTokenExpired()) {
    window.location.href = './dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {

    applyThemeFromStorage();

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

            const { token, user } = await authService.login({ email, password });
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

    function applyThemeFromStorage() {
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark';
        
        // Aplicar tema solo si está configurado como oscuro
        if (isDark) {
            document.body.classList.add('dark-theme');
            
            // También puedes forzar el tema oscuro en el dashboard
            localStorage.setItem('theme', 'dark');
        } else {
            // Asegurarse de que esté en modo claro si no hay preferencia
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    }

});

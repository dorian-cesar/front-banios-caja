export function showAlert(message, type = 'warning', timeout = 5000) {
    const container = document.getElementById('alerts');
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>`;
    container.appendChild(wrapper);
    if (timeout) setTimeout(() => {
        const alertEl = wrapper.querySelector('.alert');
        if (alertEl) bootstrap.Alert.getOrCreateInstance(alertEl).close();
    }, timeout);
}

export function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 mb-2`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  container.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

export function showConfirmToast(message, onConfirm, onCancel) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast align-items-center text-bg-warning border-0 mb-2';
  toast.innerHTML = `
    <div class="d-flex flex-column p-2">
      <div class="toast-body mb-2">${message}</div>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-success confirmBtn">Confirmar</button>
        <button class="btn btn-sm btn-secondary cancelBtn">Cancelar</button>
      </div>
    </div>
  `;

  container.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { autohide: false });
  bsToast.show();

  toast.querySelector('.confirmBtn').addEventListener('click', () => { onConfirm(); bsToast.hide(); });
  toast.querySelector('.cancelBtn').addEventListener('click', () => { onCancel?.(); bsToast.hide(); });
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}

// Alternar visibilidade de seções
export function showSection(sectionId) {
  document.querySelectorAll('section, #loginSection, #registerSection, #configSection').forEach(sec => sec.classList.add('d-none'));
  document.getElementById(sectionId).classList.remove('d-none');
}

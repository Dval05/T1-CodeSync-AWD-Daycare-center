export function showToast({ title = 'Acción realizada', message = '', type = 'success', timeout = 3000 } = {}) {
  const container = document.getElementById('toast-notification');
  if (!container) return;
  const color = type === 'error' ? 'bg-red-100 border-red-300 text-red-800' : (type === 'warning' ? 'bg-yellow-100 border-yellow-300 text-yellow-800' : 'bg-green-100 border-green-300 text-green-800');
  container.innerHTML = `
    <div class="max-w-sm w-full border ${color} rounded-lg shadow p-4 flex items-start space-x-3">
      <div class="pt-1">${type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅'}</div>
      <div class="flex-1">
        <div class="font-semibold">${title}</div>
        ${message ? `<div class="text-sm opacity-80">${message}</div>` : ''}
      </div>
      <button id="toast-close" class="text-gray-500 hover:text-gray-700">✖</button>
    </div>`;
  requestAnimationFrame(() => {
    container.classList.remove('translate-x-full');
  });
  const close = () => {
    container.classList.add('translate-x-full');
  };
  document.getElementById('toast-close')?.addEventListener('click', close);
  if (timeout) setTimeout(close, timeout);
}

export function confirmAction(message = '¿Confirmas la acción?') {
  return Promise.resolve(window.confirm(message));
}

export function formToObject(form) {
  const data = new FormData(form);
  const obj = {};
  for (const [k, v] of data.entries()) obj[k] = v;
  return obj;
}

// Google Identity Services initialization
export function initGoogleAuth() {
  const clientId = window.__ENV?.GOOGLE_CLIENT_ID;
  if (!clientId || !window.google || !window.google.accounts || !window.google.accounts.id) {
    console.warn('Google Identity Services no inicializado o falta GOOGLE_CLIENT_ID');
    return;
  }

  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleCredential,
    auto_select: false,
    ux_mode: 'popup',
  });

  const container = document.getElementById('googleSignIn');
  if (container) {
    window.google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', shape: 'rectangular' });
  }
}

function handleGoogleCredential(response) {
  const idToken = response?.credential;
  if (!idToken) return;
  localStorage.setItem('google_id_token', idToken);
  window.location.href = '/html/dashboard.html';
}

// Auto init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initGoogleAuth();
});
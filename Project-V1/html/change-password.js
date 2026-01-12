import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

(function wireChangePassword() {
  const form = document.getElementById('changePassForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPass = document.getElementById('newPass').value;
    const confirm = document.getElementById('confirmPass').value;
    if (newPass !== confirm) {
      return showToast({ title: 'Las contraseñas no coinciden', type: 'warning' });
    }
    if (!newPass || newPass.length < 8) {
      return showToast({ title: 'Mínimo 8 caracteres', type: 'warning' });
    }
    const { error } = await supabase.auth.updateUser({ password: newPass, data: { must_change_password: false } });
    if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
    showToast({ title: 'Contraseña actualizada', message: 'Ya puedes usar el sistema.', type: 'success' });
    // Refrescar posteando un pequeño delay para que el token se actualice
    setTimeout(() => window.location.reload(), 800);
  });
})();

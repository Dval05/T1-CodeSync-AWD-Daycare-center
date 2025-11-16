import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

async function getCurrentAppUser() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from('user').select('*').eq('AuthUserID', user.id).maybeSingle();
  if (error) return null;
  return data || null;
}

async function loadProfile() {
  const u = await getCurrentAppUser();
  if (!u) {
    showToast({ title: 'Sin sesión', type: 'warning' });
    return;
  }
  qs('#userName').value = u.UserName || '';
  qs('#email').value = u.Email || '';
  qs('#firstName').value = u.FirstName || '';
  qs('#lastName').value = u.LastName || '';
  qs('#phone').value = u.Phone || '';
  qs('#address').value = u.Address || '';
}

function wireEvents() {
  qs('#refreshProfile')?.addEventListener('click', loadProfile);
  qs('#profileForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = await getCurrentAppUser();
    if (!u) return showToast({ title: 'Sin sesión', type: 'warning' });
    const payload = {
      UserName: qs('#userName').value.trim() || null,
      Email: qs('#email').value.trim() || null,
      FirstName: qs('#firstName').value.trim() || null,
      LastName: qs('#lastName').value.trim() || null,
      Phone: qs('#phone').value.trim() || null,
      Address: qs('#address').value.trim() || null,
      UpdatedAt: new Date().toISOString()
    };
    const { error } = await supabase.from('user').update(payload).eq('UserID', u.UserID);
    if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
    showToast({ title: 'Perfil actualizado' });
  });
}

(async function init(){
  await loadProfile();
  wireEvents();
})();

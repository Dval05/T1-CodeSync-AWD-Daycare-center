import supabase from 'supabaseClient';

const qs = (s) => document.querySelector(s);

async function currentAppUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('user').select('UserID').eq('AuthUserID', user.id).maybeSingle();
  return data?.UserID || null;
}

async function loadTopNotifications() {
  const uid = await currentAppUserId();
  const list = qs('#notifListTop');
  const badge = qs('#notifBadge');
  if (!uid) {
    if (badge) badge.classList.add('hidden');
    if (list) list.innerHTML = '<div class="p-2 text-gray-500">Sin sesión</div>';
    return;
  }
  const { data, error } = await supabase
    .from('notification')
    .select('NotificationID, Subject, Message, IsRead, CreatedAt, SenderID, sender:SenderID(UserName)')
    .eq('ReceiverID', uid)
    .order('CreatedAt', { ascending: false })
    .limit(10);
  if (error) {
    if (list) list.innerHTML = `<div class="p-2 text-red-600">${error.message}</div>`;
    return;
  }
  const unread = (data || []).filter(n => !n.IsRead || n.IsRead === 0).length;
  if (badge) {
    if (unread > 0) {
      badge.textContent = String(unread);
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
  if (list) {
    list.innerHTML = (data || []).map(n => {
      const from = n.sender?.UserName ? `de ${n.sender.UserName}` : '';
      const cls = n.IsRead ? 'text-gray-600' : 'text-gray-800 font-semibold';
      const time = new Date(n.CreatedAt).toLocaleString();
      const safeMsg = (n.Message || '').replace(/</g, '&lt;');
      return `<button data-id="${n.NotificationID}" class="block w-full text-left p-2 rounded hover:bg-gray-50">
        <div class="${cls}">${n.Subject || 'Sin asunto'}</div>
        <div class="text-xs text-gray-500">${from} • ${time}</div>
        <div class="text-xs text-gray-600 truncate">${safeMsg}</div>
      </button>`;
    }).join('') || '<div class="p-2 text-gray-500">Sin notificaciones</div>';
  }
}

async function markAsRead(id) {
  if (!id) return;
  await supabase.from('notification').update({ IsRead: 1, ReadAt: new Date().toISOString() }).eq('NotificationID', id);
}

function wireTopbarEvents() {
  const btn = qs('#notifButton');
  const dd = qs('#notifDropdown');
  const profileBtn = qs('#profileButton');
  if (btn && dd) {
    btn.addEventListener('click', async () => {
      dd.classList.toggle('hidden');
      if (!dd.classList.contains('hidden')) await loadTopNotifications();
    });
    document.addEventListener('click', (e) => {
      if (!dd.classList.contains('hidden')) {
        const t = e.target;
        if (!dd.contains(t) && t !== btn && !btn.contains(t)) dd.classList.add('hidden');
      }
    });
    qs('#notifListTop')?.addEventListener('click', async (e) => {
      const b = e.target.closest('button[data-id]');
      if (!b) return;
      const id = parseInt(b.getAttribute('data-id'), 10);
      await markAsRead(id);
      await loadTopNotifications();
    });
  }
  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      if (typeof window.loadContent === 'function') {
        window.loadContent('/html/profile.html', 'Mi Perfil');
      } else {
        window.location.href = '/html/profile.html';
      }
    });
  }
}

(async function init(){
  wireTopbarEvents();
  await loadWelcomeName();
  await loadTopNotifications();
  // refresco periódico del badge
  setInterval(loadTopNotifications, 60000);
})();

async function loadWelcomeName() {
  const wrap = document.querySelector('#welcomeBubble');
  const nameEl = document.querySelector('#welcomeName');
  if (!wrap || !nameEl) return;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { wrap.classList.add('hidden'); return; }
    const { data } = await supabase.from('user').select('FirstName').eq('AuthUserID', authUser.id).maybeSingle();
    const first = (data?.FirstName || authUser.user_metadata?.first_name || (authUser.email ? authUser.email.split('@')[0] : '') || '').trim();
    if (first) {
      nameEl.textContent = first;
      wrap.classList.remove('hidden');
    } else {
      wrap.classList.add('hidden');
    }
  } catch (_) {
    // si falla, ocultar
    wrap.classList.add('hidden');
  }
}

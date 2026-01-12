import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

async function currentAppUserId() {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;
	const { data } = await supabase.from('user').select('UserID').eq('AuthUserID', user.id).maybeSingle();
	return data?.UserID || null;
}

async function loadUsersInto(selectEl) {
	const { data, error } = await supabase.from('user').select('UserID, UserName, Email').order('UserName');
	if (error) return;
	selectEl.innerHTML = (data||[]).map(u => `<option value="${u.UserID}">${u.UserName || u.Email}</option>`).join('');
}

async function loadMyNotifications() {
	const uid = await currentAppUserId();
	const list = qs('#notifList');
	if (!uid) { list.textContent = 'Sin sesión'; return; }
	const { data, error } = await supabase
		.from('notification')
		.select('NotificationID, Type, Priority, Subject, Message, IsRead, CreatedAt, SenderID, sender:SenderID(UserName)')
		.eq('ReceiverID', uid)
		.order('CreatedAt', { ascending: false })
		.limit(100);
	if (error) { list.textContent = error.message; return; }
	list.innerHTML = (data||[]).map(n => {
		const badge = n.IsRead === 1 ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700';
		const from = n.sender?.UserName ? `de ${n.sender.UserName}` : '';
		return `<div class="border rounded p-3">
			<div class="flex justify-between">
				<div class="font-semibold">${n.Subject || n.Type}</div>
				<span class="text-xs px-2 py-0.5 rounded ${badge}">${n.IsRead ? 'Leído' : 'Nuevo'}</span>
			</div>
			<div class="text-xs text-gray-500">${from} • ${new Date(n.CreatedAt).toLocaleString()}</div>
			<div class="mt-1">${(n.Message||'').replace(/</g,'&lt;')}</div>
		</div>`;
	}).join('');
}

function wireEvents() {
	qs('#refreshNotif')?.addEventListener('click', loadMyNotifications);
	qs('#notifForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const sender = await currentAppUserId();
		const payload = {
			ReceiverID: qs('#notifReceiver').value ? parseInt(qs('#notifReceiver').value, 10) : null,
			SenderID: sender,
			Type: qs('#notifType').value || 'Message',
			Subject: qs('#notifSubject').value.trim() || null,
			Message: qs('#notifMessage').value.trim(),
			Priority: 'Normal'
		};
		const { error } = await supabase.from('notification').insert(payload);
		if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
		showToast({ title: 'Notificación enviada' });
		qs('#notifMessage').value = '';
		await loadMyNotifications();
	});
}

(async function init(){
	await loadUsersInto(qs('#notifReceiver'));
	await loadMyNotifications();
	wireEvents();
})();
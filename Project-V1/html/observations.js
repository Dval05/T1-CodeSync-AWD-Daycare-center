import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

async function loadStudentsIntoSelect(selectedId) {
	const sel = qs('#obsStudent');
	if (!sel) return;
	sel.innerHTML = '<option value="">Cargando...</option>';
	const { data, error } = await supabase.from('student').select('StudentID, FirstName, LastName').order('FirstName');
	if (error) { sel.innerHTML = '<option value="">Error</option>'; return; }
	sel.innerHTML = (data || []).map(s => `<option value="${s.StudentID}">${s.FirstName} ${s.LastName}</option>`).join('');
	if (selectedId) sel.value = String(selectedId);
}

async function getCurrentEmpId() {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;
	const { data: u } = await supabase.from('user').select('UserID').eq('AuthUserID', user.id).maybeSingle();
	if (!u?.UserID) return null;
	const { data: emp } = await supabase.from('employee').select('EmpID').eq('UserID', u.UserID).maybeSingle();
	return emp?.EmpID || null;
}

function openObsModal(obs) {
	qs('#obsModalTitle').textContent = obs?.ObservationID ? 'Editar Observación' : 'Nueva Observación';
	qs('#obsId').value = obs?.ObservationID || '';
	loadStudentsIntoSelect(obs?.StudentID);
	qs('#obsDate').value = obs?.ObservationDate || new Date().toISOString().slice(0,10);
	qs('#obsCategory').value = obs?.Category || '';
	qs('#obsText').value = obs?.Observation || '';
	qs('#obsPositive').checked = obs?.IsPositive === 1;
	qs('#obsRequires').checked = obs?.RequiresAction === 1;
	qs('#obsPrivate').checked = obs?.IsPrivate === 1;
	const modal = qs('#obsModal');
	modal.classList.remove('hidden');
	modal.classList.add('flex');
}

function closeObsModal() {
	const modal = qs('#obsModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

async function loadObservations() {
	const tbody = qs('#obsTableBody');
	if (!tbody) return;
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="5">Cargando...</td></tr>';
	const { data, error } = await supabase
		.from('student_observation')
		.select('ObservationID, StudentID, ObservationDate, Category, Observation, student:StudentID(FirstName, LastName)')
		.order('ObservationDate', { ascending: false })
		.limit(200);
	if (error) {
		tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="5">${error.message}</td></tr>`;
		return;
	}
	tbody.innerHTML = (data || []).map(o => `
		<tr class="bg-white border-b">
			<td class="px-6 py-3">${o.ObservationDate || ''}</td>
			<td class="px-6 py-3">${o.student ? `${o.student.FirstName} ${o.student.LastName}` : ''}</td>
			<td class="px-6 py-3">${o.Category || ''}</td>
			<td class="px-6 py-3 truncate" title="${(o.Observation||'').replace(/"/g,'&quot;')}">${(o.Observation || '').slice(0,80)}${(o.Observation||'').length>80?'…':''}</td>
			<td class="px-6 py-3 space-x-2">
				<button data-action="edit" data-id="${o.ObservationID}" class="text-blue-600 hover:text-blue-900"><i class="fas fa-edit"></i></button>
				<button data-action="delete" data-id="${o.ObservationID}" class="text-red-600 hover:text-red-900"><i class="fas fa-trash"></i></button>
			</td>
		</tr>`).join('');
}

function wireEvents() {
	document.getElementById('addObsBtn')?.addEventListener('click', () => openObsModal({}));
	document.getElementById('cancelObsBtn')?.addEventListener('click', closeObsModal);
	document.getElementById('obsForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = qs('#obsId').value;
		const empId = await getCurrentEmpId();
		const payload = {
			StudentID: qs('#obsStudent').value ? parseInt(qs('#obsStudent').value, 10) : null,
			EmpID: empId,
			ObservationDate: qs('#obsDate').value || new Date().toISOString().slice(0,10),
			Category: qs('#obsCategory').value.trim() || null,
			Observation: qs('#obsText').value.trim(),
			IsPositive: qs('#obsPositive').checked ? 1 : 0,
			RequiresAction: qs('#obsRequires').checked ? 1 : 0,
			IsPrivate: qs('#obsPrivate').checked ? 1 : 0,
		};
		let res;
		if (id) res = await supabase.from('student_observation').update(payload).eq('ObservationID', parseInt(id, 10));
		else res = await supabase.from('student_observation').insert(payload);
		if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
		showToast({ title: 'Observación guardada' });
		closeObsModal();
		loadObservations();
	});

	document.getElementById('obsTableBody')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = parseInt(btn.getAttribute('data-id'), 10);
		const action = btn.getAttribute('data-action');
		if (action === 'edit') {
			const { data } = await supabase.from('student_observation').select('*').eq('ObservationID', id).single();
			openObsModal(data);
		} else if (action === 'delete') {
			const { error } = await supabase.from('student_observation').delete().eq('ObservationID', id);
			if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
			showToast({ title: 'Observación eliminada' });
			loadObservations();
		}
	});
}

(async function init() {
	await loadObservations();
	wireEvents();
})();
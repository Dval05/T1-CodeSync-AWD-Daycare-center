import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

function openGuardianModal(g) {
	qs('#guardianModalTitle').textContent = g?.GuardianID ? 'Editar Responsable' : 'Añadir Responsable';
	qs('#guardianId').value = g?.GuardianID || '';
	qs('#firstName').value = g?.FirstName || '';
	qs('#lastName').value = g?.LastName || '';
	qs('#document').value = g?.DocumentNumber || '';
	qs('#relationship').value = g?.Relationship || '';
	qs('#phone').value = g?.PhoneNumber || '';
	qs('#email').value = g?.Email || '';
	qs('#address').value = g?.Address || '';
	qs('#occupation').value = g?.Occupation || '';
	qs('#workPhone').value = g?.WorkPhone || '';
	qs('#isEmergency').checked = g?.IsEmergencyContact === 1;
	qs('#isPickup').checked = g?.IsAuthorizedPickup !== 0;
	const modal = qs('#guardianModal');
	modal.classList.remove('hidden');
	modal.classList.add('flex');
}

function closeGuardianModal() {
	const modal = qs('#guardianModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

async function loadGuardians() {
	const tbody = qs('#guardiansTableBody');
	if (!tbody) return;
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="5">Cargando...</td></tr>';
	const { data, error } = await supabase
		.from('guardian')
		.select('GuardianID, FirstName, LastName, Relationship, PhoneNumber, Email, IsActive')

		.order('CreatedAt', { ascending: false });
	if (error) {
		tbody.innerHTML = `<tr><td class=\"px-6 py-4 text-red-600\" colspan=\"5\">${error.message}</td></tr>`;
		return;
	}
		tbody.innerHTML = (data || []).map(g => {
			const isActive = g.IsActive === 1 || g.IsActive === true;
			return `
		<tr class="bg-white border-b">
			<td class="px-6 py-4 font-medium text-gray-900">${g.FirstName} ${g.LastName}</td>
			<td class="px-6 py-4">${g.Relationship || ''}</td>
			<td class="px-6 py-4">${g.PhoneNumber || ''}</td>
			<td class="px-6 py-4">${g.Email || ''}</td>
			<td class="px-6 py-4 space-x-2">
				<button data-action="edit" data-id="${g.GuardianID}" class="text-blue-600 hover:text-blue-900"><i class="fas fa-edit"></i></button>
				<button data-action="toggle" data-id="${g.GuardianID}" data-active="${isActive ? 1 : 0}" class="text-gray-600 hover:text-gray-900" title="${isActive ? 'Inactivar' : 'Activar'}">
					<i class="fas ${isActive ? 'fa-eye' : 'fa-eye-slash'}"></i>
				</button>
			</td>
		</tr>`;
		}).join('');
}

function wireEvents() {
	document.getElementById('addGuardianBtn')?.addEventListener('click', () => openGuardianModal({}));
	document.getElementById('cancelGuardianBtn')?.addEventListener('click', closeGuardianModal);
	document.getElementById('guardianForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = qs('#guardianId').value;
		const payload = {
			FirstName: qs('#firstName').value.trim(),
			LastName: qs('#lastName').value.trim(),
			DocumentNumber: qs('#document').value.trim() || null,
			Relationship: qs('#relationship').value.trim() || null,
			PhoneNumber: qs('#phone').value.trim() || null,
			Email: qs('#email').value.trim() || null,
			Address: qs('#address').value.trim() || null,
			Occupation: qs('#occupation').value.trim() || null,
			WorkPhone: qs('#workPhone').value.trim() || null,
			IsEmergencyContact: qs('#isEmergency').checked ? 1 : 0,
			IsAuthorizedPickup: qs('#isPickup').checked ? 1 : 0,
		};
		let res;
		if (id) res = await supabase.from('guardian').update(payload).eq('GuardianID', parseInt(id, 10));
		else res = await supabase.from('guardian').insert(payload);
		if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
		showToast({ title: 'Responsable guardado' });
		closeGuardianModal();
		loadGuardians();
	});

	document.getElementById('guardiansTableBody')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = parseInt(btn.getAttribute('data-id'), 10);
		const action = btn.getAttribute('data-action');
		if (action === 'edit') {
			const { data } = await supabase.from('guardian').select('*').eq('GuardianID', id).single();
			openGuardianModal(data);
		} else if (action === 'toggle') {
			const current = btn.getAttribute('data-active');
			const isActive = current === '1' || current === 'true';
			const next = isActive ? 0 : 1;
			const { error } = await supabase.from('guardian').update({ IsActive: next }).eq('GuardianID', id);
			if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
			showToast({ title: next === 1 ? 'Responsable activado' : 'Responsable inactivado' });
			loadGuardians();
		}
	});
}

(async function init() {
	await loadGuardians();
	wireEvents();
})();
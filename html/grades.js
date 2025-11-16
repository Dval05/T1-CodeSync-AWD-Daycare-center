import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

function openGradeModal(grade) {
	qs('#gradeModalTitle').textContent = grade?.GradeID ? 'Editar Grado' : 'Añadir Grado';
	qs('#gradeId').value = grade?.GradeID || '';
	qs('#gradeName').value = grade?.GradeName || '';
	qs('#gradeDescription').value = grade?.Description || '';
	qs('#ageMin').value = grade?.AgeRangeMin ?? '';
	qs('#ageMax').value = grade?.AgeRangeMax ?? '';
	qs('#maxCapacity').value = grade?.MaxCapacity ?? '';
	qs('#isActive').checked = (grade?.IsActive === 1 || grade?.IsActive === true || grade?.IsActive === undefined);
	const modal = qs('#gradeModal');
	modal.classList.remove('hidden');
	modal.classList.add('flex');
}

function closeGradeModal() {
	const modal = qs('#gradeModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

async function loadGrades() {
	const tbody = qs('#gradesTableBody');
	if (!tbody) return;
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="5">Cargando...</td></tr>';
	const { data, error } = await supabase.from('grade').select('*').order('GradeName');
	if (error) {
		tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="5">${error.message}</td></tr>`;
		return;
	}
	tbody.innerHTML = (data || []).map(g => {
		const isActive = g.IsActive === 1 || g.IsActive === true;
		const statusClass = isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
		return `
			<tr class="bg-white border-b">
				<td class="px-6 py-4 font-medium text-gray-900">${g.GradeName}</td>
				<td class="px-6 py-4">${g.AgeRangeMin ?? ''} - ${g.AgeRangeMax ?? ''}</td>
				<td class="px-6 py-4">${g.MaxCapacity ?? ''}</td>
				<td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">${isActive ? 'Activo' : 'Inactivo'}</span></td>
				<td class="px-6 py-4 space-x-2">
					<button data-action="edit" data-id="${g.GradeID}" class="text-blue-600 hover:text-blue-900"><i class="fas fa-edit"></i></button>
					<button data-action="toggle" data-id="${g.GradeID}" data-active="${isActive ? 1 : 0}" class="text-gray-600 hover:text-gray-900" title="${isActive ? 'Inactivar' : 'Activar'}">
						<i class="fas ${isActive ? 'fa-eye' : 'fa-eye-slash'}"></i>
					</button>
				</td>
			</tr>`;
	}).join('');
}

function wireEvents() {
	document.getElementById('addGradeBtn')?.addEventListener('click', () => openGradeModal({}));
	document.getElementById('cancelGradeBtn')?.addEventListener('click', closeGradeModal);
	document.getElementById('gradeForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = qs('#gradeId').value;
		const payload = {
			GradeName: qs('#gradeName').value.trim(),
			Description: qs('#gradeDescription').value.trim() || null,
			AgeRangeMin: qs('#ageMin').value ? parseInt(qs('#ageMin').value, 10) : null,
			AgeRangeMax: qs('#ageMax').value ? parseInt(qs('#ageMax').value, 10) : null,
			MaxCapacity: qs('#maxCapacity').value ? parseInt(qs('#maxCapacity').value, 10) : null,
			IsActive: qs('#isActive').checked ? 1 : 0,
		};
		let res;
		if (id) res = await supabase.from('grade').update(payload).eq('GradeID', parseInt(id, 10));
		else res = await supabase.from('grade').insert(payload);
		if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
		showToast({ title: 'Grado guardado' });
		closeGradeModal();
		loadGrades();
	});

	document.getElementById('gradesTableBody')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = parseInt(btn.getAttribute('data-id'), 10);
		const action = btn.getAttribute('data-action');
		if (action === 'edit') {
			const { data } = await supabase.from('grade').select('*').eq('GradeID', id).single();
			openGradeModal(data);
		} else if (action === 'toggle') {
			const current = btn.getAttribute('data-active');
			const isActive = current === '1' || current === 'true';
			const next = isActive ? 0 : 1;
			const { error } = await supabase.from('grade').update({ IsActive: next }).eq('GradeID', id);
			if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
			showToast({ title: next === 1 ? 'Grado activado' : 'Grado inactivado' });
			loadGrades();
		}
	});
}

(async function init() {
	await loadGrades();
	wireEvents();
})();
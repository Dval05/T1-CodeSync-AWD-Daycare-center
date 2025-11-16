import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

async function loadGrades(selectEl, includeAll=false) {
	const { data, error } = await supabase.from('grade').select('GradeID, GradeName, IsActive').order('GradeName');
	if (error) return;
	selectEl.innerHTML = '';
	if (includeAll) {
		const o = document.createElement('option');
		o.value = '';
		o.textContent = 'Todos';
		selectEl.appendChild(o);
	}
	(data || []).forEach(g => {
		const o = document.createElement('option');
		o.value = g.GradeID;
		o.textContent = g.GradeName;
		selectEl.appendChild(o);
	});
}

async function loadEmployees(selectEl, includeAll=false) {
	const { data, error } = await supabase.from('employee').select('EmpID, FirstName, LastName, IsActive').eq('IsActive', 1).order('FirstName');
	if (error) return;
	selectEl.innerHTML = '';
	if (includeAll) {
		const o = document.createElement('option');
		o.value = '';
		o.textContent = 'Todos';
		selectEl.appendChild(o);
	}
	(data || []).forEach(e => {
		const o = document.createElement('option');
		o.value = e.EmpID;
		o.textContent = `${e.FirstName} ${e.LastName}`;
		selectEl.appendChild(o);
	});
}

async function loadActivities() {
	const tbody = qs('#activitiesTableBody');
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="6">Cargando...</td></tr>';
	const gradeId = qs('#actGradeFilter').value || null;
	const status = qs('#actStatusFilter').value || null;
	const from = qs('#actFrom').value || null;
	const to = qs('#actTo').value || null;

	let q = supabase
		.from('activity')
		.select('ActivityID, Name, ScheduledDate, StartTime, EndTime, Status, IsActive, grade:GradeID(GradeName)')
		.order('ScheduledDate', { ascending: false });
	if (gradeId) q = q.eq('GradeID', parseInt(gradeId, 10));
	if (status) q = q.eq('Status', status);
	if (from) q = q.gte('ScheduledDate', from);
	if (to) q = q.lte('ScheduledDate', to);

	const { data, error } = await q;
	if (error) {
		tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="6">${error.message}</td></tr>`;
		return;
	}
		tbody.innerHTML = (data || []).map(a => {
		const gname = a.grade?.GradeName || '';
		const time = a.StartTime || a.EndTime ? `${a.StartTime || ''} - ${a.EndTime || ''}` : '';
		const stBadge = {
			Planned: 'bg-gray-100 text-gray-800',
			InProgress: 'bg-amber-100 text-amber-800',
			Completed: 'bg-green-100 text-green-800',
			Canceled: 'bg-red-100 text-red-800'
		}[a.Status] || 'bg-gray-100 text-gray-800';
			const isActive = a.IsActive === 1 || a.IsActive === true;
		return `
			<tr class="bg-white border-b">
				<td class="px-6 py-4 font-medium text-gray-900">${a.Name}</td>
				<td class="px-6 py-4">${gname}</td>
				<td class="px-6 py-4">${a.ScheduledDate || ''}</td>
					<td class="px-6 py-4">${time}</td>
				<td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${stBadge}">${a.Status}</span></td>
				<td class="px-6 py-4 space-x-2">
					<button data-action="media" data-id="${a.ActivityID}" class="text-amber-600 hover:text-amber-800" title="Multimedia"><i class="fas fa-photo-film"></i></button>
					<button data-action="edit" data-id="${a.ActivityID}" class="text-blue-600 hover:text-blue-900" title="Editar"><i class="fas fa-edit"></i></button>
						<button data-action="toggle" data-id="${a.ActivityID}" data-active="${isActive ? 1 : 0}" class="text-gray-600 hover:text-gray-900" title="${isActive ? 'Inactivar' : 'Activar'}">
							<i class="fas ${isActive ? 'fa-eye' : 'fa-eye-slash'}"></i>
						</button>
				</td>
			</tr>`;
	}).join('');
}

function openActivityModal(act) {
	qs('#activityModalTitle').textContent = act?.ActivityID ? 'Editar Actividad' : 'Añadir Actividad';
	qs('#actId').value = act?.ActivityID || '';
	qs('#actName').value = act?.Name || '';
	qs('#actDate').value = act?.ScheduledDate || '';
	qs('#actStart').value = act?.StartTime || '';
	qs('#actEnd').value = act?.EndTime || '';
	qs('#actLocation').value = act?.Location || '';
	qs('#actCategory').value = act?.Category || '';
	qs('#actStatus').value = act?.Status || 'Planned';
	qs('#actDesc').value = act?.Description || '';
	const mediaBtn = qs('#openMediaBtn');
	if (act?.ActivityID) {
		mediaBtn.classList.remove('hidden');
		mediaBtn.onclick = () => openMediaModal(act.ActivityID);
	} else {
		mediaBtn.classList.add('hidden');
		mediaBtn.onclick = null;
	}
	Promise.all([loadGrades(qs('#actGrade')), loadEmployees(qs('#actEmp'))]).then(() => {
		if (act?.GradeID) qs('#actGrade').value = act.GradeID;
		if (act?.EmpID) qs('#actEmp').value = act.EmpID;
	});
	const modal = qs('#activityModal');
	modal.classList.remove('hidden');
	modal.classList.add('flex');
}

function closeActivityModal() {
	const modal = qs('#activityModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

function openMediaModal(activityId) {
	qs('#mediaActId').value = activityId;
	const modal = qs('#mediaModal');
	modal.classList.remove('hidden');
	modal.classList.add('flex');
	loadMedia(activityId);
}

function closeMediaModal() {
	const modal = qs('#mediaModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

async function loadMedia(activityId) {
	const list = qs('#mediaList');
	list.innerHTML = '<div class="text-gray-500">Cargando...</div>';
	const { data, error } = await supabase
		.from('activity_media')
		.select('MediaID, MediaType, FilePath, FileSize, Caption')
		.eq('ActivityID', activityId)
		.order('CreatedAt', { ascending: false });
	if (error) {
		list.innerHTML = `<div class="text-red-600">${error.message}</div>`;
		return;
	}
	const bucket = supabase.storage.from('activities');
	list.innerHTML = (data || []).map(m => {
		const { data:pub } = bucket.getPublicUrl(m.FilePath);
		const url = pub?.publicUrl || '#';
		let content = '';
		if (m.MediaType === 'Image') content = `<img src="${url}" alt="${m.Caption || ''}" class="w-full h-40 object-cover rounded">`;
		else if (m.MediaType === 'Video') content = `<video controls class="w-full h-40 rounded"><source src="${url}"></video>`;
		else content = `<a href="${url}" target="_blank" class="text-blue-600 hover:underline">Documento</a>`;
		return `
			<div class="border rounded p-2 flex flex-col">
				<div class="flex-1">${content}</div>
				<div class="mt-2 text-xs text-gray-600">${m.Caption || ''}</div>
				<div class="mt-2 flex justify-end">
					<button class="text-red-600 hover:text-red-800" data-action="del-media" data-id="${m.MediaID}"><i class="fas fa-trash"></i></button>
				</div>
			</div>`;
	}).join('');
}

function detectMediaType(file) {
	const t = file.type || '';
	if (t.startsWith('image/')) return 'Image';
	if (t.startsWith('video/')) return 'Video';
	return 'Document';
}

async function uploadCoverIfAny(activityId) {
	const fileInput = qs('#actCover');
	const file = fileInput?.files?.[0];
	if (!file) return;
	const bucket = supabase.storage.from('activities');
	const path = `${activityId}/cover_${Date.now()}_${file.name}`;
	const { error: upErr } = await bucket.upload(path, file, { upsert: true });
	if (upErr) {
		showToast({ title: 'Error al subir portada', message: upErr.message, type: 'error' });
		return;
	}
	await supabase.from('activity').update({ ImagePath: path }).eq('ActivityID', activityId);
}

function wireEvents() {
	qs('#addActivityBtn')?.addEventListener('click', () => openActivityModal({}));
	qs('#cancelActBtn')?.addEventListener('click', closeActivityModal);
	qs('#refreshActivities')?.addEventListener('click', loadActivities);
	qs('#actGradeFilter')?.addEventListener('change', loadActivities);
	qs('#actStatusFilter')?.addEventListener('change', loadActivities);
	qs('#actFrom')?.addEventListener('change', loadActivities);
	qs('#actTo')?.addEventListener('change', loadActivities);

	qs('#activityForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = qs('#actId').value;
		const payload = {
			Name: qs('#actName').value || null,
			GradeID: qs('#actGrade').value ? parseInt(qs('#actGrade').value, 10) : null,
			EmpID: qs('#actEmp').value ? parseInt(qs('#actEmp').value, 10) : null,
			ScheduledDate: qs('#actDate').value || null,
			StartTime: qs('#actStart').value || null,
			EndTime: qs('#actEnd').value || null,
			Location: qs('#actLocation').value || null,
			Category: qs('#actCategory').value || null,
			Status: qs('#actStatus').value || 'Planned',
			Description: qs('#actDesc').value || null,
		};
		let res;
		if (id) {
			res = await supabase.from('activity').update(payload).eq('ActivityID', parseInt(id, 10)).select('ActivityID').single();
		} else {
			res = await supabase.from('activity').insert(payload).select('ActivityID').single();
		}
		if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
		const actId = res.data?.ActivityID || parseInt(id, 10);
		await uploadCoverIfAny(actId);
		showToast({ title: 'Actividad guardada' });
		closeActivityModal();
		loadActivities();
	});

	qs('#activitiesTableBody')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = parseInt(btn.getAttribute('data-id'), 10);
		const action = btn.getAttribute('data-action');
		if (action === 'edit') {
			const { data } = await supabase.from('activity').select('*').eq('ActivityID', id).single();
			openActivityModal(data);
		} else if (action === 'toggle') {
			const current = btn.getAttribute('data-active');
			const isActive = current === '1' || current === 'true';
			const next = isActive ? 0 : 1;
			const { error } = await supabase.from('activity').update({ IsActive: next }).eq('ActivityID', id);
			if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
			showToast({ title: next === 1 ? 'Actividad activada' : 'Actividad inactivada' });
			loadActivities();
		} else if (action === 'media') {
			openMediaModal(id);
		}
	});

	qs('#closeMediaBtn')?.addEventListener('click', closeMediaModal);
	qs('#mediaList')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button[data-action="del-media"]');
		if (!btn) return;
		const mid = parseInt(btn.getAttribute('data-id'), 10);
		const { error } = await supabase.from('activity_media').delete().eq('MediaID', mid);
		if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
		showToast({ title: 'Archivo eliminado' });
		const aid = parseInt(qs('#mediaActId').value, 10);
		loadMedia(aid);
	});

	qs('#uploadMediaBtn')?.addEventListener('click', async () => {
		const aid = parseInt(qs('#mediaActId').value, 10);
		const files = Array.from(qs('#mediaFiles').files || []);
		const caption = qs('#mediaCaption').value || null;
		if (!aid || files.length === 0) return;
		const bucket = supabase.storage.from('activities');
		for (const file of files) {
			const path = `${aid}/${Date.now()}_${file.name}`;
			const { error: upErr } = await bucket.upload(path, file, { upsert: true });
			if (upErr) {
				showToast({ title: 'Error de subida', message: upErr.message, type: 'error' });
				continue;
			}
			const MediaType = detectMediaType(file);
			const FileSize = file.size;
			const payload = { ActivityID: aid, MediaType, FilePath: path, FileSize, Caption: caption };
			const { error: dbErr } = await supabase.from('activity_media').insert(payload);
			if (dbErr) showToast({ title: 'Error guardando metadata', message: dbErr.message, type: 'error' });
		}
		showToast({ title: 'Subida completada' });
		qs('#mediaFiles').value = '';
		qs('#mediaCaption').value = '';
		loadMedia(aid);
	});
}

(async function init() {
	await loadGrades(qs('#actGradeFilter'), true);
	await loadActivities();
	wireEvents();
})();
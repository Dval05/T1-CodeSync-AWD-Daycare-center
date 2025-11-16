import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

const STATUS = ['Present','Absent','Late','Excused'];

function timeInput(value = '') {
	return `<input type="time" value="${value || ''}" class="att-time mt-1 block w-full rounded-md border-gray-300 shadow-sm" />`;
}

function statusSelect(value = 'Present') {
	const opts = STATUS.map(s => `<option value="${s}" ${s === value ? 'selected' : ''}>${s}</option>`).join('');
	return `<select class="att-status mt-1 block w-full rounded-md border-gray-300 shadow-sm">${opts}</select>`;
}

async function loadGradesIntoFilter() {
	const sel = qs('#gradeFilter');
	sel.innerHTML = '<option value="">Todos</option>';
	const { data, error } = await supabase.from('grade').select('GradeID, GradeName').order('GradeName');
	if (error) return;
	(data || []).forEach(g => {
		const o = document.createElement('option');
		o.value = g.GradeID;
		o.textContent = g.GradeName;
		sel.appendChild(o);
	});
}

async function fetchStudents(gradeId) {
	let q = supabase.from('student').select('StudentID, FirstName, LastName, GradeID, IsActive').order('FirstName');
	if (gradeId) q = q.eq('GradeID', parseInt(gradeId, 10));
	const { data, error } = await q;
	if (error) throw error;
	return data || [];
}

async function fetchAttendanceByDate(date) {
	const { data, error } = await supabase
		.from('attendance')
		.select('AttendanceID, StudentID, Date, CheckInTime, CheckOutTime, Status, Notes')
		.eq('Date', date);
	if (error) throw error;
	const map = new Map();
	(data || []).forEach(a => map.set(a.StudentID, a));
	return map;
}

function getDateValue() {
	const input = qs('#attDate');
	if (!input.value) {
		const today = new Date().toISOString().slice(0, 10);
		input.value = today;
	}
	return input.value;
}

async function loadAttendance() {
	const tbody = qs('#attTableBody');
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="6">Cargando...</td></tr>';
	try {
		const date = getDateValue();
		const gradeId = qs('#gradeFilter').value || null;
		const [students, attMap] = await Promise.all([
			fetchStudents(gradeId),
			fetchAttendanceByDate(date)
		]);
		tbody.innerHTML = (students || []).map(st => {
			const att = attMap.get(st.StudentID) || {};
			return `
				<tr class="bg-white border-b" data-student-id="${st.StudentID}">
					<td class="px-6 py-4 font-medium text-gray-900">${st.FirstName} ${st.LastName}</td>
					<td class="px-6 py-4">${statusSelect(att.Status || 'Present')}</td>
					<td class="px-6 py-4">${timeInput(att.CheckInTime || '')}</td>
					<td class="px-6 py-4">${timeInput(att.CheckOutTime || '')}</td>
					<td class="px-6 py-4"><input type="text" class="att-notes mt-1 block w-full rounded-md border-gray-300 shadow-sm" value="${att.Notes || ''}"></td>
					<td class="px-6 py-4"><button class="att-save bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded">Guardar</button></td>
				</tr>`;
		}).join('');
	} catch (e) {
		tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="6">${e.message}</td></tr>`;
	}
}

async function saveRow(tr) {
	const studentId = parseInt(tr.getAttribute('data-student-id'), 10);
	const status = tr.querySelector('.att-status').value;
	const cin = tr.querySelector('.att-time')?.value || null; // first time input
	const times = tr.querySelectorAll('.att-time');
	const checkIn = times[0]?.value || null;
	const checkOut = times[1]?.value || null;
	const notes = tr.querySelector('.att-notes')?.value || null;
	const date = getDateValue();

	// Si se marca Ausente, exigir cédula del estudiante (Ecuador)
	if (status === 'Absent') {
		try {
			const { data: st } = await supabase.from('student').select('DocumentNumber').eq('StudentID', studentId).single();
			let ced = st?.DocumentNumber || '';
			if (!ced || !/^[0-9]{10}$/.test(ced)) {
				// Pedir cédula al usuario
				ced = window.prompt('Ingrese número de cédula del estudiante (10 dígitos):', ced || '') || '';
				if (!/^[0-9]{10}$/.test(ced)) {
					return showToast({ title: 'Cédula inválida', message: 'Debe tener 10 dígitos', type: 'warning' });
				}
				// Intentar guardar la cédula en la ficha del estudiante
				const { error: upErr } = await supabase.from('student').update({ DocumentNumber: ced }).eq('StudentID', studentId);
				if (upErr) {
					const msg = /unique|duplicate/i.test(upErr.message) ? 'La cédula ya existe en otro estudiante' : upErr.message;
					return showToast({ title: 'Error', message: msg, type: 'error' });
				}
			}
		} catch (_) { /* ignore */ }
	}

	// Buscar si existe registro
	const { data: existing, error: selErr } = await supabase
		.from('attendance')
		.select('AttendanceID')
		.eq('StudentID', studentId)
		.eq('Date', date)
		.maybeSingle();
	if (selErr && selErr.code !== 'PGRST116') {
		return showToast({ title: 'Error', message: selErr.message, type: 'error' });
	}
	if (existing) {
		const { error } = await supabase
			.from('attendance')
			.update({ Status: status, CheckInTime: checkIn, CheckOutTime: checkOut, Notes: notes })
			.eq('AttendanceID', existing.AttendanceID);
		if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
	} else {
		const { error } = await supabase
			.from('attendance')
			.insert({ StudentID: studentId, Date: date, Status: status, CheckInTime: checkIn, CheckOutTime: checkOut, Notes: notes });
		if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
	}
	showToast({ title: 'Asistencia guardada' });
}

function wireEvents() {
	document.getElementById('refreshAtt')?.addEventListener('click', loadAttendance);
	document.getElementById('gradeFilter')?.addEventListener('change', loadAttendance);
	const dateInput = qs('#attDate');
	if (dateInput) dateInput.addEventListener('change', loadAttendance);

	document.getElementById('attTableBody')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button.att-save');
		if (!btn) return;
		const tr = btn.closest('tr');
		await saveRow(tr);
	});
}

(async function init() {
	// Pre-cargar fecha (hoy)
	getDateValue();
	await loadGradesIntoFilter();
	await loadAttendance();
	wireEvents();
})();
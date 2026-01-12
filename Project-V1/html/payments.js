import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

async function loadStudents(selectEl, includeAll=false) {
	const { data, error } = await supabase.from('student').select('StudentID, FirstName, LastName, IsActive').order('FirstName');
	if (error) return;
	selectEl.innerHTML = '';
	if (includeAll) {
		const o = document.createElement('option');
		o.value = '';
		o.textContent = 'Todos';
		selectEl.appendChild(o);
	}
	(data || []).forEach(s => {
		const o = document.createElement('option');
		o.value = s.StudentID;
		o.textContent = `${s.FirstName} ${s.LastName}`;
		selectEl.appendChild(o);
	});

	if (selectEl && selectEl.id === 'payStudentFilter') {
		selectEl.addEventListener('change', async () => {
			const id = selectEl.value ? parseInt(selectEl.value, 10) : null;
			await showStudentInfo(id, qs('.student-info'));
			// Mostrar controles de foto si hay estudiante seleccionado
			const entry = document.querySelector('#paymentEntries .payment-entry');
			if (entry) togglePhotoControls(entry, !!id);
		});
		if (selectEl.value) {
			const id = selectEl.value ? parseInt(selectEl.value, 10) : null;
			await showStudentInfo(id, qs('.student-info'));
			const entry = document.querySelector('#paymentEntries .payment-entry');
			if (entry) togglePhotoControls(entry, !!id);
		}
	}
	// Permitir que los selects de nuevas entradas también tengan funcionalidad
	if (selectEl && selectEl.classList && selectEl.classList.contains('entry-student')) {
		selectEl.addEventListener('change', async () => {
			const entry = selectEl.closest('.payment-entry');
			const id = selectEl.value ? parseInt(selectEl.value, 10) : null;
			await showStudentInfo(id, entry.querySelector('.student-info'));
			togglePhotoControls(entry, !!id);
		});
	}
}

async function showStudentInfo(studentId, containerEl) {
	if (!containerEl) return;
	containerEl.innerHTML = '<p class="text-sm text-gray-500">Cargando...</p>';
	const id = studentId ? Number(studentId) : null;
	if (!id) {
		containerEl.innerHTML = '<p class="font-medium text-gray-800">Seleccione un estudiante</p>';
		return;
	}
	try {
		const { data, error } = await supabase.from('student').select('*').eq('StudentID', id).single();
		if (error || !data) {
			console.error('showStudentInfo error:', error);
			containerEl.innerHTML = '<p class="text-sm text-red-600">No se pudo cargar la información</p>';
			return;
		}
		const parts = [];
		parts.push(`<p class="font-medium text-gray-800">${data.FirstName || ''} ${data.LastName || ''}</p>`);
		if (data.GuardianName) parts.push(`<p>Responsable: ${data.GuardianName}</p>`);
		if (data.Phone) parts.push(`<p>Tel: ${data.Phone}</p>`);
		if (data.DOB) parts.push(`<p>FNac: ${data.DOB}</p>`);
		parts.push(`<p class="text-xs ${data.IsActive ? 'text-green-600' : 'text-gray-500'}">${data.IsActive ? 'Activo' : 'Inactivo'}</p>`);
		containerEl.innerHTML = parts.join('');
	} catch (err) {
		console.error('showStudentInfo exception:', err);
		containerEl.innerHTML = '<p class="text-sm text-red-600">No se pudo cargar la información</p>';
	}
}

// NUEVO: Mostrar/ocultar controles de foto según si hay estudiante seleccionado
function togglePhotoControls(entry, show) {
	const img = entry.querySelector('.student-photo-preview');
	const input = entry.querySelector('.student-photo-input');
	const btn = entry.querySelector('.upload-photo-btn');
	if (img) img.style.display = show ? '' : 'none';
	if (input) input.style.display = show ? '' : 'none';
	if (btn) btn.style.display = show ? '' : 'none';
	if (!show && img) img.src = '';
}

// NUEVO: Manejar selección y subida de imagen local
function wirePhotoEvents(entry) {
	const img = entry.querySelector('.student-photo-preview');
	const input = entry.querySelector('.student-photo-input');
	const btn = entry.querySelector('.upload-photo-btn');
	if (!img || !input || !btn) return;

	// Al hacer click en la imagen o el botón, abrir el selector de archivos
	img.addEventListener('click', () => input.click());
	btn.addEventListener('click', () => input.click());

	// Al seleccionar archivo, mostrar preview
	input.addEventListener('change', () => {
		const file = input.files && input.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = () => {
				img.src = reader.result;
				img.style.display = '';
			};
			reader.readAsDataURL(file);
		}
	});
}

function createPaymentEntry() {
	const tpl = document.getElementById('paymentEntryTemplate');
	if (!tpl) return;
	const clone = tpl.firstElementChild.cloneNode(true);

	// NUEVO: Agregar un select para estudiante en cada nueva entrada
	const studentDiv = clone.querySelector('.student-info');
	if (studentDiv) {
		// Elimina selects previos si existen
		const oldSelect = clone.querySelector('.entry-student');
		if (oldSelect) oldSelect.remove();
		// Crea un nuevo select
		const select = document.createElement('select');
		select.className = 'entry-student mt-2 block rounded-md border-gray-300 shadow-sm min-w-[180px]';
		studentDiv.insertBefore(select, studentDiv.firstChild.nextSibling);
		// Carga estudiantes en el nuevo select
		loadStudents(select, false);
	}

	document.getElementById('paymentEntries').appendChild(clone);
	wirePhotoEvents(clone);
}

function wireEvents() {
	document.getElementById('addPayBtn')?.addEventListener('click', () => {
		createPaymentEntry();
	});

	document.getElementById('refreshPays')?.addEventListener('click', () => {
		// Refresh functionality can be added here
		console.log('Refresh clicked');
	});

	// NUEVO: Inicializar eventos de foto en la entrada principal
	const firstEntry = document.querySelector('#paymentEntries .payment-entry');
	if (firstEntry) wirePhotoEvents(firstEntry);
}

(async function init() {
	await loadStudents(qs('#payStudentFilter'), true);
	wireEvents();
})();

import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

const TASK_STATUSES = ['Pending','InProgress','Completed','Canceled'];
const TASK_PRIORITIES = ['Low','Medium','High','Urgent'];

function fillSelect(select, options, placeholder) {
	select.innerHTML = '';
	if (placeholder) {
		const opt = document.createElement('option');
		opt.value = '';
		opt.textContent = placeholder;
		select.appendChild(opt);
	}
	options.forEach(v => {
		const o = document.createElement('option');
		o.value = v;
		o.textContent = v;
		select.appendChild(o);
	});
}

async function loadEmployeesIntoSelect(selectedId) {
	const sel = qs('#empSelect');
	if (!sel) return;
	const { data, error } = await supabase
		.from('employee')
		.select('EmpID, FirstName, LastName, IsActive')
		.order('FirstName');
	if (error) {
		showToast({ title: 'Error', message: error.message, type: 'error' });
		return;
	}
	sel.innerHTML = '';
	(data || []).forEach(e => {
		const opt = document.createElement('option');
		opt.value = e.EmpID;
		opt.textContent = `${e.FirstName} ${e.LastName}${(e.IsActive === 1 || e.IsActive === true) ? '' : ' (inactivo)'}`;
		if (selectedId && Number(selectedId) === e.EmpID) opt.selected = true;
		sel.appendChild(opt);
	});
}

function openTaskModal(task) {
	qs('#taskModalTitle').textContent = task?.TaskID ? 'Editar Tarea' : 'Añadir Tarea';
	qs('#taskId').value = task?.TaskID || '';
	qs('#taskName').value = task?.TaskName || '';
	qs('#taskDescription').value = task?.Description || '';
	qs('#dueDate').value = task?.DueDate || '';
	fillSelect(qs('#taskStatus'), TASK_STATUSES);
	fillSelect(qs('#taskPriority'), TASK_PRIORITIES);
	if (task?.Status) qs('#taskStatus').value = task.Status;
	if (task?.Priority) qs('#taskPriority').value = task.Priority;
	loadEmployeesIntoSelect(task?.EmpID);
	const modal = qs('#taskModal');
	modal.classList.remove('hidden');
	modal.classList.add('flex');
}

function closeTaskModal() {
	const modal = qs('#taskModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

async function loadTasks() {
	const tbody = qs('#tasksTableBody');
	if (!tbody) return;
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="6">Cargando...</td></tr>';
	const { data, error } = await supabase
		.from('employee_task')
		.select('TaskID, TaskName, Description, DueDate, Status, Priority, EmpID, employee:EmpID(FirstName, LastName)')
		.order('CreatedAt', { ascending: false });
	if (error) {
		tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="6">${error.message}</td></tr>`;
		return;
	}
	tbody.innerHTML = (data || []).map(t => {
		const empName = t.employee ? `${t.employee.FirstName} ${t.employee.LastName}` : '';
		const prBadge = {
			Low: 'bg-gray-100 text-gray-800',
			Medium: 'bg-blue-100 text-blue-800',
			High: 'bg-amber-100 text-amber-800',
			Urgent: 'bg-red-100 text-red-800'
		}[t.Priority] || 'bg-gray-100 text-gray-800';
		const stBadge = {
			Pending: 'bg-gray-100 text-gray-800',
			InProgress: 'bg-indigo-100 text-indigo-800',
			Completed: 'bg-green-100 text-green-800',
			Canceled: 'bg-red-100 text-red-800'
		}[t.Status] || 'bg-gray-100 text-gray-800';
		const due = t.DueDate || '';
		return `
			<tr class="bg-white border-b">
				<td class="px-6 py-4 font-medium text-gray-900">${t.TaskName}</td>
				<td class="px-6 py-4">${empName}</td>
				<td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${prBadge}">${t.Priority || ''}</span></td>
				<td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${stBadge}">${t.Status || ''}</span></td>
				<td class="px-6 py-4">${due}</td>
				<td class="px-6 py-4 space-x-2">
					<button data-action="edit" data-id="${t.TaskID}" class="text-blue-600 hover:text-blue-900"><i class="fas fa-edit"></i></button>
					<button data-action="delete" data-id="${t.TaskID}" class="text-red-600 hover:text-red-900"><i class="fas fa-trash"></i></button>
				</td>
			</tr>`;
	}).join('');
}

function wireEvents() {
	document.getElementById('addTaskBtn')?.addEventListener('click', () => openTaskModal({}));
	document.getElementById('cancelTaskBtn')?.addEventListener('click', closeTaskModal);
	document.getElementById('taskForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = qs('#taskId').value;
		const payload = {
			TaskName: qs('#taskName').value.trim(),
			Description: qs('#taskDescription').value.trim() || null,
			EmpID: qs('#empSelect').value ? parseInt(qs('#empSelect').value, 10) : null,
			Priority: qs('#taskPriority').value,
			Status: qs('#taskStatus').value,
			DueDate: qs('#dueDate').value || null,
		};
		let res;
		if (id) res = await supabase.from('employee_task').update(payload).eq('TaskID', parseInt(id, 10));
		else res = await supabase.from('employee_task').insert(payload);
		if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
		showToast({ title: 'Tarea guardada' });
		closeTaskModal();
		loadTasks();
	});

	document.getElementById('tasksTableBody')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = parseInt(btn.getAttribute('data-id'), 10);
		const action = btn.getAttribute('data-action');
		if (action === 'edit') {
			const { data } = await supabase.from('employee_task').select('*').eq('TaskID', id).single();
			openTaskModal(data);
		} else if (action === 'delete') {
			const { error } = await supabase.from('employee_task').delete().eq('TaskID', id);
			if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
			showToast({ title: 'Tarea eliminada' });
			loadTasks();
		}
	});
}

(async function init() {
	// Pre-cargar selects base
	fillSelect(qs('#taskStatus'), TASK_STATUSES, 'Seleccione estado');
	fillSelect(qs('#taskPriority'), TASK_PRIORITIES, 'Seleccione prioridad');
	await loadEmployeesIntoSelect();
	await loadTasks();
	wireEvents();
})();
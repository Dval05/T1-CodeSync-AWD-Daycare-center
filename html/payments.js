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
}

async function loadPayments() {
	const tbody = qs('#paymentsTableBody');
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="7">Cargando...</td></tr>';
	const studentId = qs('#payStudentFilter').value || null;
	const status = qs('#payStatusFilter').value || null;
	let q = supabase.from('student_payment').select('StudentPaymentID, StudentID, TotalAmount, PaidAmount, BalanceRemaining, DueDate, Status, student:StudentID(FirstName, LastName)').order('CreatedAt', { ascending: false });
	if (studentId) q = q.eq('StudentID', parseInt(studentId, 10));
	if (status) q = q.eq('Status', status);
	const { data, error } = await q;
	if (error) {
		tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="7">${error.message}</td></tr>`;
		return;
	}
	tbody.innerHTML = (data || []).map(p => {
		const name = p.student ? `${p.student.FirstName} ${p.student.LastName}` : '';
		const bal = (p.BalanceRemaining != null) ? p.BalanceRemaining : (Number(p.TotalAmount || 0) - Number(p.PaidAmount || 0));
		const stBadge = {
			Pending: 'bg-gray-100 text-gray-800',
			Partial: 'bg-amber-100 text-amber-800',
			Paid: 'bg-green-100 text-green-800',
			Canceled: 'bg-red-100 text-red-800'
		}[p.Status] || 'bg-gray-100 text-gray-800';
		return `
			<tr class="bg-white border-b">
				<td class="px-6 py-4 font-medium text-gray-900">${name}</td>
				<td class="px-6 py-4">$${Number(p.TotalAmount || 0).toFixed(2)}</td>
				<td class="px-6 py-4">$${Number(p.PaidAmount || 0).toFixed(2)}</td>
				<td class="px-6 py-4">$${Number(bal || 0).toFixed(2)}</td>
				<td class="px-6 py-4">${p.DueDate || ''}</td>
				<td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${stBadge}">${p.Status}</span></td>
				<td class="px-6 py-4 space-x-2">
					<button data-action="edit" data-id="${p.StudentPaymentID}" class="text-blue-600 hover:text-blue-900" title="Editar"><i class="fas fa-edit"></i></button>
					<button data-action="delete" data-id="${p.StudentPaymentID}" class="text-red-600 hover:text-red-900" title="Eliminar"><i class="fas fa-trash"></i></button>
				</td>
			</tr>`;
	}).join('');
}

function openPayModal(pay) {
	qs('#payModalTitle').textContent = pay?.StudentPaymentID ? 'Editar Pago' : 'Añadir Pago';
	qs('#payId').value = pay?.StudentPaymentID || '';
	qs('#payTotal').value = pay?.TotalAmount ?? '';
	qs('#payPaid').value = pay?.PaidAmount ?? 0;
	qs('#payDue').value = pay?.DueDate ?? '';
	qs('#payMethod').value = pay?.PaymentMethod || 'Cash';
	qs('#payStatus').value = pay?.Status || 'Pending';
	qs('#payNotes').value = pay?.Notes || '';
	loadStudents(qs('#payStudent')).then(() => {
		if (pay?.StudentID) qs('#payStudent').value = pay.StudentID;
	});
	const modal = qs('#payModal');
	modal.classList.remove('hidden');
	modal.classList.add('flex');
}

function closePayModal() {
	const modal = qs('#payModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

function wireEvents() {
	document.getElementById('addPayBtn')?.addEventListener('click', () => openPayModal({}));
	document.getElementById('cancelPayBtn')?.addEventListener('click', closePayModal);
	document.getElementById('refreshPays')?.addEventListener('click', loadPayments);
	document.getElementById('payStudentFilter')?.addEventListener('change', loadPayments);
	document.getElementById('payStatusFilter')?.addEventListener('change', loadPayments);

	document.getElementById('payForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = qs('#payId').value;
		const payload = {
			StudentID: qs('#payStudent').value ? parseInt(qs('#payStudent').value, 10) : null,
			TotalAmount: qs('#payTotal').value ? Number(qs('#payTotal').value) : null,
			PaidAmount: qs('#payPaid').value ? Number(qs('#payPaid').value) : 0,
			BalanceRemaining: null, // se calcula si no se proporciona
			DueDate: qs('#payDue').value || null,
			PaymentMethod: qs('#payMethod').value || null,
			Status: qs('#payStatus').value || 'Pending',
			Notes: qs('#payNotes').value || null,
		};
		if (payload.BalanceRemaining == null && payload.TotalAmount != null) {
			payload.BalanceRemaining = Number(payload.TotalAmount) - Number(payload.PaidAmount || 0);
		}
		let res;
		if (id) res = await supabase.from('student_payment').update(payload).eq('StudentPaymentID', parseInt(id, 10));
		else res = await supabase.from('student_payment').insert(payload);
		if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
		showToast({ title: 'Pago guardado' });
		closePayModal();
		loadPayments();
	});

	document.getElementById('paymentsTableBody')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = parseInt(btn.getAttribute('data-id'), 10);
		const action = btn.getAttribute('data-action');
		if (action === 'edit') {
			const { data } = await supabase.from('student_payment').select('*').eq('StudentPaymentID', id).single();
			openPayModal(data);
		} else if (action === 'delete') {
			const { error } = await supabase.from('student_payment').delete().eq('StudentPaymentID', id);
			if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
			showToast({ title: 'Pago eliminado' });
			loadPayments();
		}
	});
}

(async function init() {
	await loadStudents(qs('#payStudentFilter'), true);
	await loadPayments();
	wireEvents();
})();
import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);

async function loadPaymentsIntoRef(selectEl) {
	const { data, error } = await supabase
		.from('student_payment')

		.select('StudentPaymentID, TotalAmount, student:StudentID(FirstName, LastName)')
		.order('StudentPaymentID', { ascending: false })
		.limit(100);
	if (error) return;
	selectEl.innerHTML = '';
	const empty = document.createElement('option');
	empty.value = '';
	empty.textContent = 'Sin referencia';
	selectEl.appendChild(empty);
	(data || []).forEach(p => {
		const o = document.createElement('option');
		o.value = p.StudentPaymentID;
		o.textContent = `${p.student?.FirstName || ''} ${p.student?.LastName || ''} - Pago #${p.StudentPaymentID} - $${Number(p.TotalAmount||0).toFixed(2)}`;
		selectEl.appendChild(o);
	});
}

async function loadInvoices() {
	const tbody = qs('#invoicesTableBody');
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="8">Cargando...</td></tr>';
	const t = qs('#invTypeFilter').value || null;
	let q = supabase.from('invoice').select('InvoiceID, InvoiceNumber, InvoiceType, ReferenceID, IssueDate, DueDate, FinalAmount, Status').order('CreatedAt', { ascending: false });
	if (t) q = q.eq('InvoiceType', t);
	const { data, error } = await q;
	if (error) {
		tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="8">${error.message}</td></tr>`;
		return;
	}
	tbody.innerHTML = (data || []).map(inv => {
		const stBadge = {
			Draft: 'bg-gray-100 text-gray-800',
			Issued: 'bg-blue-100 text-blue-800',
			Paid: 'bg-green-100 text-green-800',
			Overdue: 'bg-amber-100 text-amber-800',
			Canceled: 'bg-red-100 text-red-800'
		}[inv.Status] || 'bg-gray-100 text-gray-800';
		return `
			<tr class="bg-white border-b">
				<td class="px-6 py-4 font-medium text-gray-900">${inv.InvoiceNumber}</td>
				<td class="px-6 py-4">${inv.InvoiceType}</td>
				<td class="px-6 py-4">${inv.ReferenceID || ''}</td>
				<td class="px-6 py-4">${inv.IssueDate || ''}</td>
				<td class="px-6 py-4">${inv.DueDate || ''}</td>
				<td class="px-6 py-4">$${Number(inv.FinalAmount || 0).toFixed(2)}</td>
				<td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${stBadge}">${inv.Status}</span></td>
				<td class="px-6 py-4 space-x-2">
					<button data-action="edit" data-id="${inv.InvoiceID}" class="text-blue-600 hover:text-blue-900" title="Editar"><i class="fas fa-edit"></i></button>
					<button data-action="delete" data-id="${inv.InvoiceID}" class="text-red-600 hover:text-red-900" title="Eliminar"><i class="fas fa-trash"></i></button>
				</td>
			</tr>`;
	}).join('');
}

function openInvModal(inv) {
	qs('#invModalTitle').textContent = inv?.InvoiceID ? 'Editar Factura' : 'Nueva Factura';
	qs('#invId').value = inv?.InvoiceID || '';
	qs('#invNumber').value = inv?.InvoiceNumber || '';
	qs('#invType').value = inv?.InvoiceType || 'Student';
	qs('#invIssue').value = inv?.IssueDate || '';
	qs('#invDue').value = inv?.DueDate || '';
	qs('#invTotal').value = inv?.FinalAmount ?? '';
	qs('#invStatus').value = inv?.Status || 'Draft';
	qs('#invDesc').value = inv?.Description || '';
	loadPaymentsIntoRef(qs('#invRef')).then(() => {
		if (inv?.ReferenceID) qs('#invRef').value = inv.ReferenceID;
	});
	const modal = qs('#invModal');
	modal.classList.remove('hidden');
	modal.classList.add('flex');
}

function closeInvModal() {
	const modal = qs('#invModal');
	modal.classList.add('hidden');
	modal.classList.remove('flex');
}

function wireEvents() {
	document.getElementById('addInvBtn')?.addEventListener('click', () => openInvModal({}));
	document.getElementById('cancelInvBtn')?.addEventListener('click', closeInvModal);
	document.getElementById('refreshInv')?.addEventListener('click', loadInvoices);
	document.getElementById('invTypeFilter')?.addEventListener('change', loadInvoices);

	document.getElementById('invForm')?.addEventListener('submit', async (e) => {
		e.preventDefault();
		const id = qs('#invId').value;
		const payload = {
			InvoiceNumber: qs('#invNumber').value.trim(),
			InvoiceType: qs('#invType').value,
			ReferenceID: qs('#invRef').value ? parseInt(qs('#invRef').value, 10) : null,
			IssueDate: qs('#invIssue').value || null,
			DueDate: qs('#invDue').value || null,
			FinalAmount: qs('#invTotal').value ? Number(qs('#invTotal').value) : null,
			Description: qs('#invDesc').value || null,
			Status: qs('#invStatus').value || 'Draft',
		};
		let res;
		if (id) res = await supabase.from('invoice').update(payload).eq('InvoiceID', parseInt(id, 10));
		else res = await supabase.from('invoice').insert(payload);
		if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
		showToast({ title: 'Factura guardada' });
		closeInvModal();
		loadInvoices();
	});

	document.getElementById('invoicesTableBody')?.addEventListener('click', async (e) => {
		const btn = e.target.closest('button');
		if (!btn) return;
		const id = parseInt(btn.getAttribute('data-id'), 10);
		const action = btn.getAttribute('data-action');
		if (action === 'edit') {
			const { data } = await supabase.from('invoice').select('*').eq('InvoiceID', id).single();
			openInvModal(data);
		} else if (action === 'delete') {
			const { error } = await supabase.from('invoice').delete().eq('InvoiceID', id);
			if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
			showToast({ title: 'Factura eliminada' });
			loadInvoices();
		}
	});
}

(async function init() {
	await loadInvoices();
	wireEvents();
})();
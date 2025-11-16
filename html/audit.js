import supabase from 'supabaseClient';

async function loadAudit() {
	const tbody = document.getElementById('auditTableBody');
	tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="5">Cargando...</td></tr>';
	const { data, error } = await supabase
		.from('audit_log')
		.select('CreatedAt, Action, TableName, RecordID, UserID, user:UserID(UserName), NewData')
		.order('CreatedAt', { ascending: false })
		.limit(100);
	if (error) {
		tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="5">${error.message}</td></tr>`;
		return;
	}
	tbody.innerHTML = (data||[]).map(r => `
		<tr class="bg-white border-b">
			<td class="px-6 py-3">${new Date(r.CreatedAt).toLocaleString()}</td>
			<td class="px-6 py-3">${r.user?.UserName || r.UserID || ''}</td>
			<td class="px-6 py-3">${r.Action}</td>
			<td class="px-6 py-3">${r.TableName} #${r.RecordID ?? ''}</td>
			<td class="px-6 py-3 text-xs text-gray-600">${r.NewData ? JSON.stringify(r.NewData) : ''}</td>
		</tr>`).join('');
}

(function init(){
	document.getElementById('refreshAudit')?.addEventListener('click', loadAudit);
	loadAudit();
})();
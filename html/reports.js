import supabase from 'supabaseClient';

function fmt(n) { return Number(n||0).toLocaleString('es-EC'); }

async function loadKPIs() {
	const today = new Date().toISOString().slice(0,10);

	const [{ data: students }, { data: att }, { data: pays }] = await Promise.all([
			supabase.from('student').select('StudentID', { count: 'exact', head: true }).eq('IsActive', 1),
		supabase.from('attendance').select('AttendanceID', { count: 'exact', head: true }).eq('Date', today).eq('Status','Present'),
			supabase.from('student_payment').select('StudentPaymentID', { count: 'exact', head: true }).in('Status', ['Pending','Partial'])
	]);
	document.getElementById('repActiveStudents').textContent = fmt(students?.length ?? students?.count ?? 0);
	document.getElementById('repAttPresent').textContent = fmt(att?.length ?? att?.count ?? 0);
	document.getElementById('repPendingPays').textContent = fmt(pays?.length ?? pays?.count ?? 0);
}

async function loadAttLast7() {
	const end = new Date();
	const days = [];
	for (let i=6;i>=0;i--) {
		const d = new Date(end);
		d.setDate(end.getDate()-i);
		days.push(d.toISOString().slice(0,10));
	}
	const { data, error } = await supabase
		.from('attendance')
		.select('Date, Status', { count: 'exact' })
		.gte('Date', days[0])
		.lte('Date', days[6]);
	const map = new Map(days.map(d => [d, { Present:0, Absent:0, Late:0, Excused:0 }]));
	(data||[]).forEach(r => {
		const m = map.get(r.Date);
		if (m && r.Status in m) m[r.Status]++;
	});
	const list = document.getElementById('repAttList');
	list.innerHTML = days.map(d => {
		const m = map.get(d);
		return `<div class="flex justify-between"><span>${d}</span><span>Pres:${m.Present} Aus:${m.Absent} Tarde:${m.Late} Exc:${m.Excused}</span></div>`;
	}).join('');
}

(async function init(){
	await loadKPIs();
	await loadAttLast7();
})();
import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);
const PHP_BASE = (window.__ENV && window.__ENV.PHP_BASE_URL) || '';

let gradeMap = new Map();

async function loadGrades() {
  const sel = qs('#gradeId');
  const { data, error } = await supabase.from('grade').select('GradeID, GradeName').order('GradeName');
  if (error) return;
  gradeMap = new Map((data || []).map(g => [g.GradeID, g.GradeName]));
  if (sel) sel.innerHTML = '<option value="">Sin asignar</option>' + (data || []).map(g => `<option value="${g.GradeID}">${g.GradeName}</option>`).join('');
}

async function loadStudents() {
  const tbody = qs('#studentsTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="4">Cargando...</td></tr>';
  const { data, error } = await supabase
    .from('student')
    .select('StudentID, FirstName, LastName, GradeID, IsActive, BirthDate')
    .order('CreatedAt', { ascending: false });
  if (error) {
    tbody.innerHTML = `<tr><td class=\"px-6 py-4 text-red-600\" colspan=\"4\">${error.message}</td></tr>`;
    return;
  }
  tbody.innerHTML = (data || []).map(s => {
    const isActive = s.IsActive === 1 || s.IsActive === true;
    const statusClass = isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const gradeName = gradeMap.get(s.GradeID) || '';
    return `
      <tr class="bg-white border-b">
        <td class="px-6 py-4 font-medium text-gray-900">${s.FirstName} ${s.LastName}</td>
        <td class="px-6 py-4">${gradeName}</td>
        <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">${isActive ? 'Activo' : 'Inactivo'}</span></td>
        <td class="px-6 py-4 space-x-2">
          <button data-action="edit" data-id="${s.StudentID}" class="text-blue-600 hover:text-blue-900"><i class="fas fa-edit"></i></button>
          <button data-action="link" data-id="${s.StudentID}" class="text-purple-600 hover:text-purple-900" title="Vincular Responsable"><i class="fas fa-link"></i></button>
          <button data-action="toggle" data-id="${s.StudentID}" data-active="${isActive ? 1 : 0}" class="text-gray-600 hover:text-gray-900" title="${isActive ? 'Inactivar' : 'Activar'}">
            <i class="fas ${isActive ? 'fa-eye' : 'fa-eye-slash'}"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

function openStudentModal(student) {
  qs('#studentModalTitle').textContent = student?.StudentID ? 'Editar Estudiante' : 'Añadir Estudiante';
  qs('#studentId').value = student?.StudentID || '';
  qs('#firstName').value = student?.FirstName || '';
  qs('#lastName').value = student?.LastName || '';
  qs('#birthdate').value = student?.BirthDate || '';
  qs('#gradeId').value = student?.GradeID || '';
  const modal = qs('#studentModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeStudentModal() {
  const modal = qs('#studentModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function openLinkModal(studentId) {
  qs('#linkStudentId').value = studentId;
  const modal = qs('#linkModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeLinkModal() {
  const modal = qs('#linkModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function loadGuardiansSelect() {
  const sel = qs('#guardianSelect');
  if (!sel) return;
  sel.innerHTML = '<option value="">Cargando...</option>';
  const { data, error } = await supabase
    .from('guardian')
    .select('GuardianID, FirstName, LastName')
    .order('FirstName');
  if (error) {
    sel.innerHTML = '<option value="">Error al cargar</option>';
    return;
  }
  sel.innerHTML = '<option value="">Seleccione...</option>' + (data || []).map(g => `<option value="${g.GuardianID}">${g.FirstName} ${g.LastName}</option>`).join('');
}

async function loadLinkedGuardians(studentId) {
  const tbody = qs('#linkedGuardiansBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td class="px-6 py-2" colspan="5">Cargando...</td></tr>';
  const { data, error } = await supabase
    .from('student_guardian')
    .select('StudentID, GuardianID, IsPrimary, Priority, guardian:GuardianID (FirstName, LastName), relationship:Relationship')
    .eq('StudentID', studentId)
    .order('Priority');
  if (error) {
    tbody.innerHTML = `<tr><td class="px-6 py-2 text-red-600" colspan="5">${error.message}</td></tr>`;
    return;
  }
  tbody.innerHTML = (data || []).map(row => `
    <tr class="bg-white border-b">
      <td class="px-6 py-2">${row.guardian?.FirstName || ''} ${row.guardian?.LastName || ''}</td>
      <td class="px-6 py-2">${row.relationship || ''}</td>
      <td class="px-6 py-2">${row.IsPrimary === 1 ? 'Sí' : 'No'}</td>
      <td class="px-6 py-2">${row.Priority ?? ''}</td>
      <td class="px-6 py-2">
        <button data-action="unlink" data-student="${row.StudentID}" data-guardian="${row.GuardianID}" class="text-red-600 hover:text-red-900"><i class="fas fa-unlink"></i></button>
      </td>
    </tr>`).join('');
}

function wireEvents() {
  document.getElementById('addStudentBtn')?.addEventListener('click', () => openStudentModal({}));
  document.getElementById('cancelStudentBtn')?.addEventListener('click', closeStudentModal);
  document.getElementById('studentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = qs('#studentId').value;
    const payload = {
      FirstName: qs('#firstName').value.trim(),
      LastName: qs('#lastName').value.trim(),
      BirthDate: qs('#birthdate').value || null,
      GradeID: qs('#gradeId').value ? parseInt(qs('#gradeId').value, 10) : null,
    };
    let res;
    if (id) res = await supabase.from('student').update(payload).eq('StudentID', parseInt(id, 10));
    else res = await supabase.from('student').insert(payload);
    if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
    showToast({ title: 'Estudiante guardado' });
    closeStudentModal();
    loadStudents();
  });

  document.getElementById('studentsTableBody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-id'), 10);
    const action = btn.getAttribute('data-action');
    if (action === 'edit') {
      const { data } = await supabase.from('student').select('*').eq('StudentID', id).single();
      openStudentModal(data);
    } else if (action === 'link') {
      openLinkModal(id);
      await loadGuardiansSelect();
      await loadLinkedGuardians(id);
    } else if (action === 'toggle') {
      const current = btn.getAttribute('data-active');
      const isActive = current === '1' || current === 'true';
      const next = isActive ? 0 : 1;
      const { error } = await supabase.from('student').update({ IsActive: next }).eq('StudentID', id);
      if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
      showToast({ title: next === 1 ? 'Estudiante activado' : 'Estudiante inactivado' });
      loadStudents();
    }
  });

  document.getElementById('cancelLinkBtn')?.addEventListener('click', closeLinkModal);
  document.getElementById('linkForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = parseInt(qs('#linkStudentId').value, 10);
    const guardianId = parseInt(qs('#guardianSelect').value, 10);
    if (!guardianId) return showToast({ title: 'Seleccione un responsable', type: 'warning' });
    const payload = {
      StudentID: studentId,
      GuardianID: guardianId,
      Relationship: qs('#relationship').value.trim() || null,
      IsPrimary: qs('#isPrimary').checked ? 1 : 0,
      Priority: qs('#priority').value ? parseInt(qs('#priority').value, 10) : 1,
    };
    const { error } = await supabase.from('student_guardian').insert(payload);
    if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
    showToast({ title: 'Vinculado' });
    // Auto-provision guardian user (if not already) - backend will no-op if exists
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const resp = await fetch(`${PHP_BASE}/php/users/provision_user.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ type: 'guardian', id: guardianId, role: 'Guardian', prefer_password: true })
      });
      const info = await resp.json().catch(() => null);
      if (info?.ok) {
        const userName = info.user?.UserName || '';
        const temp = info.temp_password || '';
        const msg = temp ? `Usuario: ${userName} | Temporal: ${temp}` : `Usuario: ${userName}`;
        showToast({ title: 'Cuenta de responsable lista', message: msg, type: temp ? 'warning' : 'success', timeout: 8000 });
      }
    } catch (_) { /* ignore */ }
    await loadLinkedGuardians(studentId);
  });

  document.getElementById('linkedGuardiansBody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.getAttribute('data-action');
    if (action !== 'unlink') return;
    const studentId = parseInt(btn.getAttribute('data-student'), 10);
    const guardianId = parseInt(btn.getAttribute('data-guardian'), 10);
    const { error } = await supabase
      .from('student_guardian')
      .delete()
      .eq('StudentID', studentId)
      .eq('GuardianID', guardianId);
    if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
    showToast({ title: 'Vínculo eliminado' });
    await loadLinkedGuardians(studentId);
  });
}

(async function init() {
  await loadGrades();
  await loadStudents();
  wireEvents();
})();

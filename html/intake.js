import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);
const PHP_BASE = (window.__ENV && window.__ENV.PHP_BASE_URL) || '';

async function loadGrades() {
  const sel = qs('#stuGrade');
  const { data } = await supabase.from('grade').select('GradeID, GradeName').order('GradeName');
  sel.innerHTML = '<option value="">Sin asignar</option>' + (data || []).map(g => `<option value="${g.GradeID}">${g.GradeName}</option>`).join('');
}

async function loadRoles() {
  const sel = qs('#empRole');
  const { data } = await supabase.from('role').select('RoleName').order('RoleName');
  sel.innerHTML = (data || []).map(r => `<option value="${r.RoleName}">${r.RoleName}</option>`).join('');
  if ((data || []).some(r => r.RoleName === 'Staff')) sel.value = 'Staff';
}

function wireToggles() {
  qs('#withGuardian').addEventListener('change', (e) => {
    qs('#guardianSection').style.display = e.target.checked ? '' : 'none';
  });
  qs('#withEmployee').addEventListener('change', (e) => {
    qs('#employeeSection').style.display = e.target.checked ? '' : 'none';
  });
}

async function handleSubmit(e) {
  e.preventDefault();
  // 1) Student
  const stu = {
    FirstName: qs('#stuFirst').value.trim(),
    LastName: qs('#stuLast').value.trim(),
    BirthDate: qs('#stuBirth').value || null,
    GradeID: qs('#stuGrade').value ? parseInt(qs('#stuGrade').value, 10) : null,
  };
  const stuRes = await supabase.from('student').insert(stu).select('StudentID').single();
  if (stuRes.error) return showToast({ title: 'Error estudiante', message: stuRes.error.message, type: 'error' });
  const studentId = stuRes.data.StudentID;

  // 2) Guardian (optional)
  if (qs('#withGuardian').checked) {
    const g = {
      FirstName: qs('#guaFirst').value.trim(),
      LastName: qs('#guaLast').value.trim(),
      Email: qs('#guaEmail').value.trim() || null,
      PhoneNumber: qs('#guaPhone').value.trim() || null,
      Relationship: qs('#guaRelation').value.trim() || null,
      IsAuthorizedPickup: 1,
    };
    const gRes = await supabase.from('guardian').insert(g).select('GuardianID, Email').single();
    if (gRes.error) return showToast({ title: 'Error responsable', message: gRes.error.message, type: 'error' });
    await supabase.from('student_guardian').insert({ StudentID: studentId, GuardianID: gRes.data.GuardianID, IsPrimary: 1, Priority: 1 });
    if (gRes.data.Email) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || '';
        const resp = await fetch(`${PHP_BASE}/php/users/provision_user.php`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ type: 'guardian', id: gRes.data.GuardianID, role: 'Guardian', prefer_password: true })
        });
        const info = await resp.json().catch(() => null);
        if (info?.ok) {
          const userName = info.user?.UserName || '';
          const temp = info.temp_password || '';
          const msg = temp ? `Usuario: ${userName} | Temporal: ${temp}` : `Usuario: ${userName}`;
          showToast({ title: 'Responsable provisionado', message: msg, type: temp ? 'warning' : 'success', timeout: 8000 });
        }
      } catch (_) {}
    }
  }

  // 3) Employee (optional)
  if (qs('#withEmployee').checked) {
    const role = qs('#empRole').value || 'Staff';
    const emp = {
      FirstName: qs('#empFirst').value.trim(),
      LastName: qs('#empLast').value.trim(),
      Email: qs('#empEmail').value.trim() || null,
      Position: qs('#empPos').value.trim() || null,
      IsActive: 1,
    };
    const eRes = await supabase.from('employee').insert(emp).select('EmpID, Email').single();
    if (eRes.error) return showToast({ title: 'Error empleado', message: eRes.error.message, type: 'error' });
    if (eRes.data.Email) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || '';
        const resp = await fetch(`${PHP_BASE}/php/users/provision_user.php`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          body: JSON.stringify({ type: 'employee', id: eRes.data.EmpID, role, prefer_password: true })
        });
        const info = await resp.json().catch(() => null);
        if (info?.ok) {
          const userName = info.user?.UserName || '';
          const temp = info.temp_password || '';
          const msg = temp ? `Usuario: ${userName} | Temporal: ${temp}` : `Usuario: ${userName}`;
          showToast({ title: 'Empleado provisionado', message: msg, type: temp ? 'warning' : 'success', timeout: 8000 });
        }
      } catch (_) {}
    }
  }

  showToast({ title: 'Alta creada', message: 'Estudiante (y cuentas) creados.' });
}

(async function init() {
  await loadGrades();
  await loadRoles();
  wireToggles();
  qs('#intakeForm').addEventListener('submit', handleSubmit);
})();

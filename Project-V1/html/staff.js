import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';
const PHP_BASE = (window.__ENV && window.__ENV.PHP_BASE_URL) || '';

const qs = (s) => document.querySelector(s);
let rolesCache = [];

async function loadRoles(selectEl) {
  const { data } = await supabase.from('role').select('RoleID, RoleName').order('RoleName');
  rolesCache = data || [];
  if (!selectEl) return;
  selectEl.innerHTML = rolesCache.map(r => `<option value="${r.RoleName}">${r.RoleName}</option>`).join('');
  if (rolesCache.some(r => r.RoleName === 'Staff') && !selectEl.value) selectEl.value = 'Staff';
}

async function getRoleNameForEmployee(empId) {
  if (!empId) return null;
  const { data: emp } = await supabase.from('employee').select('UserID').eq('EmpID', empId).single();
  const userId = emp?.UserID;
  if (!userId) return null;
  const { data: ur } = await supabase.from('user_role').select('RoleID').eq('UserID', userId).limit(1).maybeSingle();
  if (!ur?.RoleID) return null;
  const { data: r } = await supabase.from('role').select('RoleName').eq('RoleID', ur.RoleID).single();
  return r?.RoleName || null;
}

async function assignRoleToEmployee(empId, roleName) {
  if (!roleName) return;
  const { data: emp } = await supabase.from('employee').select('UserID').eq('EmpID', empId).single();
  const userId = emp?.UserID;
  if (!userId) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || '';
    await fetch(`${PHP_BASE}/php/users/provision_user.php`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
      body: JSON.stringify({ type: 'employee', id: empId, role: roleName, prefer_password: true })
    });
    return;
  }
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || '';
  await fetch(`${PHP_BASE}/php/users/set_role.php`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    body: JSON.stringify({ type: 'employee', id: empId, role: roleName })
  });
}

function openEmpModal(emp) {
  qs('#empModalTitle').textContent = emp?.EmpID ? 'Editar Empleado' : 'Añadir Empleado';
  qs('#empId').value = emp?.EmpID || '';
  qs('#firstName').value = emp?.FirstName || '';
  qs('#lastName').value = emp?.LastName || '';
  qs('#documentNumber').value = emp?.DocumentNumber || '';
  qs('#position').value = emp?.Position || '';
  qs('#email').value = emp?.Email || '';
  qs('#phone').value = emp?.PhoneNumber || '';
  qs('#isActive').checked = (emp?.IsActive === 1 || emp?.IsActive === true || emp?.IsActive === undefined);
  qs('#hireDate').value = emp?.HireDate || '';
  loadRoles(qs('#roleId')).then(async () => {
    const r = emp?.EmpID ? await getRoleNameForEmployee(emp.EmpID) : null;
    if (r) qs('#roleId').value = r;
  });
  const modal = qs('#empModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeEmpModal() {
  const modal = qs('#empModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function loadEmployees() {
  const tbody = qs('#employeesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="8">Cargando...</td></tr>';
  const { data, error } = await supabase
    .from('employee')
    .select('EmpID, FirstName, LastName, Position, Email, PhoneNumber, IsActive, UserID, DocumentNumber')
    .order('CreatedAt', { ascending: false });
  if (error) {
    tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="8">${error.message}</td></tr>`;
    return;
  }
  const userIds = (data || []).map(e => e.UserID).filter(Boolean);
  let roleMap = new Map();
  if (userIds.length) {
    const { data: urs } = await supabase
      .from('user_role')
      .select('UserID, RoleID')
      .in('UserID', userIds);
    const roleIds = Array.from(new Set((urs || []).map(u => u.RoleID))).filter(Boolean);
    let roleNames = new Map();
    if (roleIds.length) {
      const { data: rs } = await supabase.from('role').select('RoleID, RoleName').in('RoleID', roleIds);
      roleNames = new Map((rs || []).map(r => [r.RoleID, r.RoleName]));
    }
    (urs || []).forEach(u => roleMap.set(u.UserID, roleNames.get(u.RoleID) || ''));
  }
  tbody.innerHTML = (data || []).map(emp => {
    const isActive = emp.IsActive === 1 || emp.IsActive === true;
    const statusClass = isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    const roleName = emp.UserID ? (roleMap.get(emp.UserID) || '') : '';
    return `
      <tr class="bg-white border-b">
        <td class="px-6 py-4 font-medium text-gray-900">${emp.FirstName} ${emp.LastName}</td>
        <td class="px-6 py-4">${emp.Position || ''}</td>
        <td class="px-6 py-4 text-gray-500">${emp.DocumentNumber || ''}</td>
        <td class="px-6 py-4">${roleName}</td>
        <td class="px-6 py-4">${emp.Email || ''}</td>
        <td class="px-6 py-4">${emp.PhoneNumber || ''}</td>
        <td class="px-6 py-4"><span class="px-2 py-1 text-xs font-medium rounded-full ${statusClass}">${isActive ? 'Activo' : 'Inactivo'}</span></td>
        <td class="px-6 py-4 space-x-2">
          <button data-action="edit" data-id="${emp.EmpID}" class="text-blue-600 hover:text-blue-900"><i class="fas fa-edit"></i></button>
          <button data-action="toggle" data-id="${emp.EmpID}" data-active="${isActive ? 1 : 0}" class="text-gray-600 hover:text-gray-900" title="${isActive ? 'Inactivar' : 'Activar'}">
            <i class="fas ${isActive ? 'fa-eye' : 'fa-eye-slash'}"></i>
          </button>
        </td>
      </tr>`;
  }).join('');
}

function wireEvents() {
  document.getElementById('addEmpBtn')?.addEventListener('click', () => openEmpModal({}));
  document.getElementById('cancelEmpBtn')?.addEventListener('click', closeEmpModal);
  document.getElementById('empForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.submitter || document.querySelector('#empForm button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    const id = qs('#empId').value;
    const doc = (qs('#documentNumber').value || '').trim();
    if (doc && !/^[0-9]{10}$/.test(doc)) {
      if (submitBtn) submitBtn.disabled = false;
      return showToast({ title: 'Cédula inválida', message: 'Debe tener 10 dígitos', type: 'warning' });
    }
    const payload = {
      FirstName: qs('#firstName').value.trim(),
      LastName: qs('#lastName').value.trim(),
      DocumentNumber: doc || null,
      Position: qs('#position').value.trim(),
      Email: qs('#email').value.trim() || null,
      PhoneNumber: qs('#phone').value.trim() || null,
      IsActive: qs('#isActive').checked ? 1 : 0,
      HireDate: qs('#hireDate').value || null,
    };
    const selectedRole = qs('#roleId')?.value || 'Staff';
    let res;
    if (id) {
      res = await supabase.from('employee').update(payload).eq('EmpID', parseInt(id, 10));
      if (!res.error) await assignRoleToEmployee(parseInt(id, 10), selectedRole);
    } else {
      res = await supabase.from('employee').insert(payload).select('EmpID, Email').single();
      try {
        const emp = res.data;
        if (emp?.EmpID && emp?.Email) {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token || '';
          const resp = await fetch(`${PHP_BASE}/php/users/provision_user.php`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
            body: JSON.stringify({ type: 'employee', id: emp.EmpID, role: selectedRole, prefer_password: true })
          });
          const info = await resp.json().catch(() => null);
          if (info?.ok) {
            const userName = info.user?.UserName || '';
            const temp = info.temp_password || '';
            const msg = temp ? `Usuario: ${userName} | Temporal: ${temp}` : `Usuario: ${userName}`;
            showToast({ title: 'Cuenta provisionada', message: msg, type: temp ? 'warning' : 'success', timeout: 8000 });
          }
        }
      } catch (_) {}
    }
    if (res.error) {
      const msg = /unique|duplicate/i.test(res.error.message) ? 'La cédula ya existe' : res.error.message;
      if (submitBtn) submitBtn.disabled = false;
      return showToast({ title: 'Error', message: msg, type: 'error' });
    }
    showToast({ title: 'Empleado guardado' });
    closeEmpModal();
    loadEmployees();
    if (submitBtn) submitBtn.disabled = false;
  });

  document.getElementById('employeesTableBody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = parseInt(btn.getAttribute('data-id'), 10);
    const action = btn.getAttribute('data-action');
    if (action === 'edit') {
      const { data } = await supabase.from('employee').select('*').eq('EmpID', id).single();
      openEmpModal(data);
    } else if (action === 'toggle') {
      const current = btn.getAttribute('data-active');
      const isActive = current === '1' || current === 'true';
      const next = isActive ? 0 : 1;
      const { error } = await supabase.from('employee').update({ IsActive: next }).eq('EmpID', id);
      if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
      showToast({ title: next === 1 ? 'Empleado activado' : 'Empleado inactivado' });
      loadEmployees();
    }
  });
}

(async function init() {
  await loadEmployees();
  wireEvents();
})();
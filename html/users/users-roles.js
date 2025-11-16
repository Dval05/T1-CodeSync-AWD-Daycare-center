import supabase from 'supabaseClient';
import { showToast } from '/js/ui.js';

const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

const roleModal = document.getElementById('roleModal');
const roleForm = document.getElementById('roleForm');
const permissionsModal = document.getElementById('permissionsModal');
const permissionsForm = document.getElementById('permissionsForm');

async function loadRoles() {
  const tbody = qs('#rolesTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="3">Cargando...</td></tr>';
  const { data, error } = await supabase.from('role').select('RoleID, RoleName, Description, IsActive, CreatedAt').order('RoleName');
  if (error) {
    tbody.innerHTML = `<tr><td class=\"px-6 py-4 text-red-600\" colspan=\"3\">${error.message}</td></tr>`;
    return;
  }
  tbody.innerHTML = (data || []).map(r => `
    <tr class="bg-white border-b">
      <td class="px-6 py-4 font-medium text-gray-900">${r.RoleName}</td>
      <td class="px-6 py-4">${r.Description || ''}</td>
      <td class="px-6 py-4 space-x-2">
        <button data-action="permissions" data-id="${r.RoleID}" data-name="${r.RoleName}" class="text-purple-600 hover:text-purple-900" title="Permisos"><i class="fas fa-shield-alt"></i></button>
        <button data-action="edit-role" data-id="${r.RoleID}" data-name="${r.RoleName}" data-description="${r.Description || ''}" class="text-blue-600 hover:text-blue-900" title="Editar"><i class="fas fa-edit"></i></button>
        <button data-action="delete-role" data-id="${r.RoleID}" class="text-red-600 hover:text-red-900" title="Eliminar"><i class="fas fa-trash"></i></button>
        <button data-action="assign-self" data-id="${r.RoleID}" class="text-green-600 hover:text-green-900" title="Asignarme este rol"><i class="fas fa-user-check"></i></button>
      </td>
    </tr>`).join('');
}

async function fetchPendingPeople() {
  // Empleados y responsables con Email y sin UserID
  const [emps, gds, roles] = await Promise.all([
    supabase.from('employee').select('EmpID, FirstName, LastName, Email, UserID').is('UserID', null).not('Email', 'is', null),
    supabase.from('guardian').select('GuardianID, FirstName, LastName, Email, UserID').is('UserID', null).not('Email', 'is', null),
    supabase.from('role').select('RoleName').order('RoleName')
  ]);
  const roleNames = (roles.data || []).map(r => r.RoleName);
  const list = [];
  (emps.data || []).forEach(e => list.push({ type: 'employee', id: e.EmpID, name: `${e.FirstName} ${e.LastName}`, email: e.Email, defaultRole: 'Staff' }));
  (gds.data || []).forEach(g => list.push({ type: 'guardian', id: g.GuardianID, name: `${g.FirstName} ${g.LastName}`, email: g.Email, defaultRole: 'Guardian' }));
  return { list, roleNames };
}

function openPendingModal() {
  const modal = document.getElementById('pendingUsersModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closePendingModal() {
  const modal = document.getElementById('pendingUsersModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

async function renderPending() {
  const tbody = document.getElementById('pendingTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="5">Cargando...</td></tr>';
  try {
    const { list, roleNames } = await fetchPendingPeople();
    if (!list.length) {
      tbody.innerHTML = '<tr><td class="px-6 py-4" colspan="5">Sin pendientes</td></tr>';
      return;
    }
    const roleOptions = (roleNames || []).map(r => `<option value="${r}">${r}</option>`).join('');
    tbody.innerHTML = list.map(p => `
      <tr class="bg-white border-b">
        <td class="px-6 py-3">${p.type === 'employee' ? 'Empleado' : 'Responsable'}</td>
        <td class="px-6 py-3">${p.name}</td>
        <td class="px-6 py-3">${p.email}</td>
        <td class="px-6 py-3">
          <select class="pending-role mt-1 block w-full rounded-md border-gray-300 shadow-sm" data-type="${p.type}" data-id="${p.id}">
            ${roleOptions}
          </select>
        </td>
        <td class="px-6 py-3">
          <button class="create-account bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded" data-type="${p.type}" data-id="${p.id}">Crear cuenta</button>
        </td>
      </tr>
    `).join('');
    // Set defaults
    tbody.querySelectorAll('select.pending-role').forEach(sel => {
      const rowType = sel.getAttribute('data-type');
      sel.value = rowType === 'employee' ? 'Staff' : (roleNames.includes('Guardian') ? 'Guardian' : (roleNames[0] || 'Staff'));
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td class="px-6 py-4 text-red-600" colspan="5">${e.message}</td></tr>`;
  }
}

function openRoleModal(role) {
  qs('#roleModalTitle').textContent = role?.RoleID ? 'Editar Rol' : 'Añadir Nuevo Rol';
  qs('#roleId').value = role?.RoleID || '';
  qs('#roleName').value = role?.RoleName || '';
  qs('#roleDescription').value = role?.Description || '';
  roleModal.classList.remove('hidden');
  roleModal.classList.add('flex');
}

function closeRoleModal() {
  roleModal.classList.add('hidden');
  roleModal.classList.remove('flex');
}

function openPermissionsModal({ roleId, roleName }) {
  qs('#permissionsRoleName').textContent = roleName;
  qs('#permissionsRoleId').value = roleId;
  permissionsModal.classList.remove('hidden');
  permissionsModal.classList.add('flex');
  renderPermissions(roleId);
}

function closePermissionsModal() {
  permissionsModal.classList.add('hidden');
  permissionsModal.classList.remove('flex');
}

async function renderPermissions(roleId) {
  const list = qs('#permissionsList');
  list.innerHTML = 'Cargando permisos...';
  const [allPerms, assigned] = await Promise.all([
    supabase.from('permission').select('"PermissionID", "Module", "Action", "Link", "Icon", "Description"').order('Module'),
    supabase.from('role_permission').select('PermissionID').eq('RoleID', roleId)
  ]);
  if (allPerms.error) {
    list.innerHTML = `<div class=\"text-red-600\">${allPerms.error.message}</div>`;
    return;
  }
  const selected = new Set((assigned.data || []).map(p => p.PermissionID));
  const groups = {};
  (allPerms.data || []).forEach(p => {
    groups[p.Module] = groups[p.Module] || [];
    groups[p.Module].push(p);
  });
  list.innerHTML = Object.entries(groups).map(([module, items]) => `
    <div>
      <h4 class="font-semibold text-gray-800 border-b pb-1 mb-2">${module}</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        ${items.map(p => `
          <label class=\"flex items-center space-x-3\">
            <input type=\"checkbox\" name=\"perm\" value=\"${p.PermissionID}\" ${selected.has(p.PermissionID) ? 'checked' : ''} class=\"form-checkbox h-5 w-5 text-purple-600 rounded\">\
            <span class=\"text-gray-700\">${p.Description || `${p.Module} - ${p.Action}`}</span>
          </label>`).join('')}
      </div>
    </div>`).join('');
}

function wireEvents() {
  document.getElementById('addUserBtn')?.addEventListener('click', async () => {
    openPendingModal();
    await renderPending();
  });
  document.getElementById('closePendingBtn')?.addEventListener('click', closePendingModal);

  document.getElementById('addRoleBtn')?.addEventListener('click', () => openRoleModal({}));
  document.getElementById('cancelRoleBtn')?.addEventListener('click', closeRoleModal);
  roleForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = qs('#roleId').value;
    const RoleName = qs('#roleName').value.trim();
    const Description = qs('#roleDescription').value.trim();
    if (!RoleName) return showToast({ title: 'Nombre requerido', type: 'warning' });
    let res;
    if (id) res = await supabase.from('role').update({ RoleName, Description }).eq('RoleID', id);
    else res = await supabase.from('role').insert({ RoleName, Description });
    if (res.error) return showToast({ title: 'Error', message: res.error.message, type: 'error' });
    showToast({ title: 'Rol guardado' });
    closeRoleModal();
    loadRoles();
  });

  document.getElementById('cancelPermissionsBtn')?.addEventListener('click', closePermissionsModal);
  permissionsForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roleId = qs('#permissionsRoleId').value;
    const checked = qsa('input[name="perm"]:checked').map(el => el.value);
    // Borrado físico de permisos (relacional) se mantiene; roles serán soft delete
    const del = await supabase.from('role_permission').delete().eq('RoleID', roleId);
    if (del.error) return showToast({ title: 'Error', message: del.error.message, type: 'error' });
    if (checked.length) {
      const payload = checked.map(pid => ({ RoleID: roleId, PermissionID: pid }));
      const ins = await supabase.from('role_permission').insert(payload);
      if (ins.error) return showToast({ title: 'Error', message: ins.error.message, type: 'error' });
    }
    showToast({ title: 'Permisos actualizados' });
    closePermissionsModal();
  });

  document.getElementById('pendingTableBody')?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button.create-account');
    if (!btn) return;
    const type = btn.getAttribute('data-type');
    const id = parseInt(btn.getAttribute('data-id'), 10);
    const sel = document.querySelector(`select.pending-role[data-type="${type}"][data-id="${id}"]`);
    const role = sel?.value || (type === 'employee' ? 'Staff' : 'Guardian');
    const PHP_BASE = (window.__ENV && window.__ENV.PHP_BASE_URL) || '';
    btn.disabled = true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const resp = await fetch(`${PHP_BASE}/php/users/provision_user.php`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ type, id, role, prefer_password: true })
      });
      const info = await resp.json().catch(() => null);
      if (!info?.ok) throw new Error(info?.error || 'No se pudo crear la cuenta');
      const temp = info.temp_password || '';
      const msg = temp ? `Usuario: ${info.user?.UserName} | Temporal: ${temp}` : `Usuario: ${info.user?.UserName}`;
      showToast({ title: 'Cuenta creada', message: msg, type: temp ? 'warning' : 'success', timeout: 8000 });
      await renderPending();
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('rolesTableBody')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const action = btn.getAttribute('data-action');
    if (action === 'edit-role') {
      openRoleModal({ RoleID: id, RoleName: btn.getAttribute('data-name'), Description: btn.getAttribute('data-description') });
    } else if (action === 'delete-role') {
      // Soft delete: marcar IsActive=0 y opcional DeletedAt
      supabase.from('role').update({ IsActive: 0 }).eq('RoleID', id).then(({ error }) => {
        if (error) return showToast({ title: 'Error', message: error.message, type: 'error' });
        showToast({ title: 'Rol desactivado (borrado lógico)' });
        loadRoles();
      });
    } else if (action === 'permissions') {
      openPermissionsModal({ roleId: id, roleName: btn.getAttribute('data-name') });
    } else if (action === 'assign-self') {
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return showToast({ title: 'No hay sesión', type: 'warning' });
        // Mapear AuthUserID (uuid) a UserID (int)
        const { data: appUser, error: userErr } = await supabase.from('user').select('UserID').eq('AuthUserID', user.id).maybeSingle();
        if (userErr || !appUser) return showToast({ title: 'Error', message: userErr?.message || 'Usuario interno no encontrado', type: 'error' });
        const userId = appUser.UserID;
        // Eliminar asignaciones previas del usuario (rol principal)
        const del = await supabase.from('user_role').delete().eq('UserID', userId); // vínculo
        if (del.error) return showToast({ title: 'Error', message: del.error.message, type: 'error' });
        const ins = await supabase.from('user_role').insert({ UserID: userId, RoleID: parseInt(id, 10) });
        if (ins.error) return showToast({ title: 'Error', message: ins.error.message, type: 'error' });
        showToast({ title: 'Rol asignado a tu usuario' });
      })();
    }
  });
}

(async function init() {
  wireEvents();
  await loadRoles();
})();
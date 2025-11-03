$(document).ready(function() {
    const $tableBody = $('#rolesTable tbody');
    const $selectRole = $('#selectRolePerms');
    const $permBody = $('#permissionsBody');
    let allPermGroups = [];
    let selectedRoleId = null;

    function loadRoles() {
        $.get('../PHP/api/users_roles/list_roles.php', function(resp) {
            $tableBody.empty();
            if (resp && resp.success && Array.isArray(resp.roles)) {
                $selectRole.empty();
                resp.roles.forEach(function(r){
                    $tableBody.append(`<tr><td>${r.RoleID}</td><td>${r.Name}</td></tr>`);
                    $selectRole.append(`<option value="${r.RoleID}">${r.Name}</option>`);
                });
                if (resp.roles.length > 0) {
                    selectedRoleId = resp.roles[0].RoleID;
                    $selectRole.val(selectedRoleId);
                    loadRolePermissions();
                }
            }
        }, 'json');
    }

    function renderPermissionMatrix(permIdsForRole) {
        $permBody.empty();
        allPermGroups.forEach(function(group){
            const readChecked = group.read ? permIdsForRole.includes(parseInt(group.read.PermID,10)) : false;
            const editIds = (group.edit || []).map(p => parseInt(p.PermID,10));
            const editChecked = editIds.length > 0 && editIds.every(id => permIdsForRole.includes(id));

            let editControls = '';
            if (group.edit && group.edit.length > 0) {
                group.edit.forEach(function(p){
                    const checked = permIdsForRole.includes(parseInt(p.PermID,10)) ? 'checked' : '';
                    editControls += `<div class="form-check form-check-inline">
                        <input class="form-check-input perm-edit" data-permid="${p.PermID}" type="checkbox" ${checked}>
                        <label class="form-check-label">${p.Name}</label>
                    </div>`;
                });
            }

            $permBody.append(`
                <tr>
                    <td>${group.entity}</td>
                    <td>
                        ${group.read ? `<input class="form-check-input perm-read" data-permid="${group.read.PermID}" type="checkbox" ${readChecked ? 'checked':''}>` : '<span class="text-muted">N/A</span>'}
                    </td>
                    <td>${editControls || '<span class="text-muted">N/A</span>'}</td>
                </tr>
            `);
        });
    }

    function loadAllPermissions() {
        return $.get('../PHP/api/users_roles/list_permissions.php', function(resp){
            if (resp && resp.success) {
                allPermGroups = resp.groups || [];
            }
        }, 'json');
    }

    function loadRolePermissions() {
        if (!selectedRoleId) return;
        $.get('../PHP/api/users_roles/list_role_permissions.php', { RoleID: selectedRoleId }, function(resp){
            const ids = (resp && resp.success && Array.isArray(resp.permIds)) ? resp.permIds : [];
            renderPermissionMatrix(ids);
        }, 'json');
    }

    $selectRole.on('change', function(){
        selectedRoleId = $(this).val();
        loadRolePermissions();
    });

    $('#saveRolePermsBtn').on('click', function(){
        if (!selectedRoleId) return;
        const ids = [];
        $('#permissionsBody input[type=checkbox]:checked').each(function(){
            const pid = parseInt($(this).data('permid'), 10);
            if (pid) ids.push(pid);
        });
        $.post('../PHP/api/users_roles/manage_permissions.php', { RoleID: selectedRoleId, 'PermIDs[]': ids }, function(resp){
            if (!(resp && resp.success)) { alert(resp.message || 'No se guardó'); }
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    // Inicialización
    $.when(loadAllPermissions()).then(function(){
        loadRoles();
    });

    $('#createRoleForm').on('submit', function(e){
        e.preventDefault();
        const name = $('#roleName').val().trim();
        if (!name) return;
        $.post('../PHP/api/users_roles/create_role.php', { Name: name }, function(resp){
            if (resp && resp.success) {
                $('#roleName').val('');
                loadRoles();
            } else {
                alert(resp.message || 'No se pudo crear el rol');
            }
        }, 'json').fail(function(){ alert('Error de red'); });
    });

    loadRoles();
});


import supabase from 'supabaseClient';

async function getCurrentUserIdInt() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
        .from('user')
        .select('UserID')
        .eq('AuthUserID', user.id)
        .maybeSingle();
    if (error) {
        console.error('Error fetching app user:', error);
        return null;
    }
    return data?.UserID || null;
}

async function ensureAdminAssigned(userId) {
    if (!userId) return;
    try {
        const { data: hasRole } = await supabase.from('user_role').select('UserRoleID').eq('UserID', userId).limit(1).maybeSingle();
        if (hasRole) return;
        // Usar RPC con SECURITY DEFINER para hacer el bootstrap evitando RLS
        await supabase.rpc('bootstrap_assign_admin');
    } catch (e) {
        console.warn('No se pudo asignar Admin automáticamente:', e?.message || e);
    }
}

async function getPermissionsForUser(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
        .from('v_user_permissions')
        .select('module, action, link, icon, description')
        .eq('user_id', userId);
    if (!error && data && data.length) {
        return (data || []).map(p => ({
            module: p.module,
            action: p.action,
            link: p.link,
            icon: p.icon,
            name: p.description || `${p.module} ${p.action}`
        }));
    }
    // Fallback si la vista no existe o está vacía: usar rol principal
    const { data: roleRow } = await supabase
        .from('user_role')
        .select('RoleID')
        .eq('UserID', userId)
        .limit(1)
        .maybeSingle();
    if (!roleRow?.RoleID) return [];
    const { data: rp, error: rpErr } = await supabase
        .from('role_permission')
        .select('permission:PermissionID ("Module", "Action", "Link", "Icon", "Description")')
        .eq('RoleID', roleRow.RoleID);
    if (rpErr) {
        console.error('Error fallback permisos por rol:', rpErr);
        return [];
    }
    return (rp || []).map(item => ({
        module: item.permission?.Module,
        action: item.permission?.Action,
        link: item.permission?.Link,
        icon: item.permission?.Icon,
        name: item.permission?.Description || `${item.permission?.Module} ${item.permission?.Action}`
    }));
}

document.addEventListener('DOMContentLoaded', async () => {
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!sidebarNav) return;

    const userId = await getCurrentUserIdInt();
    await ensureAdminAssigned(userId);
    let userPermissions = await getPermissionsForUser(userId);

    if (!userPermissions.some(p => p.module === 'Dashboard')) {
        userPermissions.unshift({ module: 'Dashboard', action: 'view', link: '/html/welcome.html', icon: 'fa-tachometer-alt', name: 'Panel de Control' });
    }
    // No forzamos 'Usuarios y Roles' para evitar exponerlo sin permiso.

    sidebarNav.innerHTML = userPermissions
        .filter(p => p.action === 'view' && p.link)
        .map(p => `
            <a href="#" onclick="loadContent('${p.link}', '${p.name}')" class="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200">
                <i class="fas ${p.icon || 'fa-circle'} w-6"></i>
                <span class="ml-3">${p.name}</span>
            </a>`)
        .join('');
});
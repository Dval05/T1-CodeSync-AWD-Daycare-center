import { supabaseAdmin } from '../config/supabase.js';






export const getRolePermissions = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ error: 'RoleID requerido' });


        const { data: rolePerms, error: rpError } = await supabaseAdmin
            .from('role_permission')
            .select('PermissionID')
            .eq('RoleID', id);

        if (rpError) return res.status(400).json({ error: rpError.message });

        const permissionIds = (rolePerms || []).map(rp => rp.PermissionID);
        if (permissionIds.length === 0) return res.json([]);


        const { data: perms, error: pError } = await supabaseAdmin
            .from('permission')
            .select('PermissionID, PermissionName, Module, Action, Description')
            .in('PermissionID', permissionIds);

        if (pError) return res.status(400).json({ error: pError.message });

        res.json(perms || []);
    } catch (error) {
        console.error('Error getRolePermissions:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

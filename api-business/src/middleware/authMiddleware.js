import supabase from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
    try {
        
        const devUserHeader = req.headers['x-dev-user'] || req.headers['X-Dev-User'];
        if (devUserHeader && process.env.NODE_ENV !== 'production') {
            const devUserId = devUserHeader;
            const { data: internalUser, error: dbError } = await supabase
                .from('user')
                .select('UserID, IsActive, guardian(GuardianID), employee(EmpID)')
                .eq('UserID', devUserId)
                .maybeSingle();

            if (dbError || !internalUser) {
                return res.status(403).json({ error: 'Usuario no encontrado (dev header)' });
            }

            if (internalUser.IsActive === 0) {
                return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador.' });
            }

            const { data: permissionsData } = await supabase
                .from('v_user_permissions')
                .select('module, action')
                .eq('user_id', internalUser.UserID);

            const permissions = (permissionsData || []).map(p => `${p.module}:${p.action}`);

            req.user = {
                authId: null,
                internalId: internalUser.UserID,
                guardianId: internalUser.guardian?.[0]?.GuardianID || null,
                empId: internalUser.employee?.[0]?.EmpID || null,
                permissions: permissions,
                isProvisioned: true
            };

            return next();
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Token faltante' });

        const token = authHeader.split(' ')[1];

        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(403).json({ error: 'Token inválido' });

        
        const { data: internalUser, error: dbError } = await supabase
            .from('user')
            .select('UserID, IsActive, guardian(GuardianID), employee(EmpID)')
            .eq('AuthUserID', user.id)
            .maybeSingle();

        
        if (dbError || !internalUser) {
            req.user = { authId: user.id, permissions: [], isProvisioned: false };
            return next();
        }

        
        if (internalUser.IsActive === 0) {
            return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador.' });
        }

        
        
        const { data: permissionsData } = await supabase
            .from('v_user_permissions')
            .select('module, action')
            .eq('user_id', internalUser.UserID);

        
        const permissions = (permissionsData || []).map(p => `${p.module}:${p.action}`);

        
        req.user = {
            authId: user.id,
            internalId: internalUser.UserID,
            guardianId: internalUser.guardian?.[0]?.GuardianID || null,
            empId: internalUser.employee?.[0]?.EmpID || null,
            permissions: permissions, 
            isProvisioned: true
        };

        next();

    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(500).json({ error: 'Error interno de autenticación' });
    }
};





export const requirePermission = (module, action) => {
    return (req, res, next) => {
        
        if (!req.user.isProvisioned) {
             if (req.path === '/sync-google') return next();
             return res.status(403).json({ error: 'Cuenta no provisionada.' });
        }

        const required = `${module}:${action}`;
        
        
        if (req.user.permissions.includes(required)) {
            return next();
        }

        return res.status(403).json({ 
            error: `Acceso denegado. Se requiere el permiso: ${module} > ${action}` 
        });
    };
};
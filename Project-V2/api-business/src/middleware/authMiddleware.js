import supabase from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Token faltante' });

        const token = authHeader.split(' ')[1];

        // 1. Validar Token con Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(403).json({ error: 'Token inválido' });

        // 2. Obtener datos internos (ID y si está activo)
        const { data: internalUser, error: dbError } = await supabase
            .from('user')
            .select('UserID, IsActive, guardian(GuardianID), employee(EmpID)')
            .eq('AuthUserID', user.id)
            .single();

        // Si no existe registro interno, es un usuario no provisionado
        if (dbError || !internalUser) {
            req.user = { authId: user.id, permissions: [], isProvisioned: false };
            return next();
        }

        // 3. Validar estado activo (Borrado Lógico)
        if (internalUser.IsActive === 0) {
            return res.status(403).json({ error: 'Usuario desactivado. Contacte al administrador.' });
        }

        // 4. CARGAR PERMISOS DINÁMICOS
        // Consultamos la vista SQL 'v_user_permissions' que une user -> role -> permissions
        const { data: permissionsData } = await supabase
            .from('v_user_permissions')
            .select('module, action')
            .eq('user_id', internalUser.UserID);

        // Creamos un array de permisos tipo strings: ["Estudiantes:edit", "Pagos:view"]
        const permissions = (permissionsData || []).map(p => `${p.module}:${p.action}`);

        // 5. Inyectar en la request
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

/**
 * Middleware para exigir un permiso específico de base de datos.
 * Uso en rutas: requirePermission('Estudiantes', 'edit')
 */
export const requirePermission = (module, action) => {
    return (req, res, next) => {
        // Excepción: Permitir sincronización inicial de Google sin permisos previos
        if (!req.user.isProvisioned) {
             if (req.path === '/sync-google') return next();
             return res.status(403).json({ error: 'Cuenta no provisionada.' });
        }

        const required = `${module}:${action}`;
        
        // Verificamos si el usuario tiene el permiso exacto
        if (req.user.permissions.includes(required)) {
            return next();
        }

        return res.status(403).json({ 
            error: `Acceso denegado. Se requiere el permiso: ${module} > ${action}` 
        });
    };
};
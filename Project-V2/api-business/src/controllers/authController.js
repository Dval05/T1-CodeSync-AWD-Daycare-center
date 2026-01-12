import supabase from '../config/supabase.js';

// =====================================================================
// 1. PROVISIONAR USUARIO MANUALMENTE (Desde Panel Admin)
// =====================================================================
export const provisionUser = async (req, res) => {
    const { type, id, email, firstName, lastName, roleName } = req.body;

    try {
        // --- A. Crear en Supabase Auth ---
        const tempPassword = "NiceKids" + Math.floor(1000 + Math.random() * 9000); 
        let authId = null;

        try {
            const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
                email,
                password: tempPassword,
                email_confirm: true,
                user_metadata: { first_name: firstName, last_name: lastName, must_change_password: true }
            });
            if (authError) throw authError;
            authId = authUser.user.id;
        } catch (e) {
            // Si ya existe en Auth, continuamos para vincular en DB interna
            if (!e.message?.includes('already registered')) throw e;
            // Si ya existe, buscamos su ID
            const { data: existingAuth } = await supabase.auth.admin.listUsers();
            const found = existingAuth.users.find(u => u.email === email);
            if (found) authId = found.id;
        }

        // --- B. Upsert en tabla 'user' (Pública) ---
        const { data: existingUser } = await supabase.from('user').select('UserID').eq('Email', email).maybeSingle();
        let dbUserId = existingUser?.UserID;

        if (dbUserId) {
            // Update y Reactivar
            const updatePayload = { FirstName: firstName, LastName: lastName, IsActive: 1 };
            if (authId) updatePayload.AuthUserID = authId;
            await supabase.from('user').update(updatePayload).eq('UserID', dbUserId);
        } else {
            // Insertar Nuevo
            if (!authId) return res.status(400).json({ error: 'Error vinculando identidad Auth.' });
            
            const username = email.split('@')[0] + Math.floor(Math.random() * 100);
            
            const { data: newUser, error: insErr } = await supabase.from('user').insert({
                AuthUserID: authId, 
                Email: email, 
                UserName: username,
                FirstName: firstName, 
                LastName: lastName, 
                IsActive: 1
            }).select('UserID').single();
            
            if (insErr) throw insErr;
            dbUserId = newUser.UserID;
        }

        // --- C. ASIGNACIÓN DE ROL ---
        // Buscamos el ID del rol basado en el nombre que envía el admin
        const { data: roleData } = await supabase.from('role').select('RoleID').eq('RoleName', roleName).maybeSingle();
        
        if (roleData) {
            // Limpiamos roles anteriores para evitar duplicados
            await supabase.from('user_role').delete().eq('UserID', dbUserId);
            // Asignamos el nuevo
            await supabase.from('user_role').insert({ 
                UserID: dbUserId, 
                RoleID: roleData.RoleID,
                AssignedBy: req.user?.internalId || null // Si lo llama un admin logueado
            });
        } else {
            return res.status(400).json({ error: `El rol '${roleName}' no existe en la base de datos.` });
        }

        // --- D. VINCULAR CON TABLA ESPECÍFICA (Employee/Guardian) ---
        if (type && id) {
            const table = type === 'employee' ? 'employee' : 'guardian';
            const idCol = type === 'employee' ? 'EmpID' : 'GuardianID';
            
            await supabase.from(table)
                .update({ UserID: dbUserId, IsActive: 1 })
                .eq(idCol, id);
        }

        res.json({ 
            ok: true, 
            message: 'Usuario provisionado correctamente', 
            credentials: { email, tempPassword } 
        });

    } catch (error) {
        console.error("Error provisionUser:", error);
        res.status(500).json({ ok: false, error: error.message });
    }
};

// =====================================================================
// 2. SINCRONIZAR LOGIN GOOGLE (Entrada automática)
// =====================================================================
export const syncGoogleUser = async (req, res) => {
    try {
        // Obtenemos datos del middleware 'requireAuth'
        const { authId } = req.user;
        const { data: { user } } = await supabase.auth.admin.getUserById(authId);
        
        if (!user) return res.status(401).json({ error: 'Usuario no encontrado en Supabase Auth' });

        const email = user.email;
        // TU CORREO DE ADMIN (Para que nunca te bloquee)
        const ADMIN_EMAIL = 'andrade.dval@gmail.com'; 

        // 1. Revisar si ya existe en nuestra tabla 'user'
        const { data: existing } = await supabase.from('user').select('UserID, IsActive').eq('AuthUserID', authId).maybeSingle();
        
        if (existing) {
            // Si existe pero estaba inactivo, lo reactivamos
            if (existing.IsActive === 0) {
                await supabase.from('user').update({ IsActive: 1 }).eq('UserID', existing.UserID);
            }
            return res.json({ ok: true, message: 'Usuario sincronizado (existente)' });
        }

        // 2. LISTA BLANCA: Buscar coincidencia en Empleados o Guardianes
        const { data: emp } = await supabase.from('employee').select('EmpID, FirstName, LastName').eq('Email', email).maybeSingle();
        const { data: grd } = await supabase.from('guardian').select('GuardianID, FirstName, LastName').eq('Email', email).maybeSingle();

        // --- SEGURIDAD CRÍTICA ---
        // Si no es empleado, ni guardián, NI es el Admin Supremo -> BLOQUEAR
        if (!emp && !grd && email !== ADMIN_EMAIL) {
            // Borramos el usuario de Auth para que no pueda seguir intentando entrar
            await supabase.auth.admin.deleteUser(authId);
            return res.status(403).json({ 
                error: 'Acceso denegado. Tu correo no está registrado como personal ni representante.' 
            });
        }

        // 3. Preparar datos para crear el usuario
        // Si es Admin y no estaba en tablas, usamos datos de Google o genéricos
        const firstName = emp?.FirstName || grd?.FirstName || user.user_metadata?.full_name?.split(' ')[0] || 'Admin';
        const lastName = emp?.LastName || grd?.LastName || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'System';
        
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        // 4. Crear registro en tabla 'user'
        const { data: newUser, error: insErr } = await supabase.from('user').insert({
            AuthUserID: authId, 
            Email: email, 
            UserName: username,
            FirstName: firstName, 
            LastName: lastName, 
            IsActive: 1
        }).select('UserID').single();

        if (insErr) throw insErr;

        // 5. ASIGNAR ROL AUTOMÁTICO
        let targetRoleName = '';

        if (email === ADMIN_EMAIL) {
            targetRoleName = 'Admin';
        } else if (emp) {
            targetRoleName = 'Empleado'; // Coincide con DB
        } else {
            targetRoleName = 'Representante'; // Coincide con DB
        }

        // Buscar ID del rol
        let { data: r } = await supabase.from('role').select('RoleID').eq('RoleName', targetRoleName).maybeSingle();
        
        // Si por alguna razón no existe el rol, fallback al primero que encuentre
        if (!r) {
             console.warn(`Rol '${targetRoleName}' no encontrado. Asignando rol por defecto.`);
             const { data: anyRole } = await supabase.from('role').select('RoleID').limit(1).single();
             r = anyRole;
        }

        if (r) {
            await supabase.from('user_role').insert({ 
                UserID: newUser.UserID, 
                RoleID: r.RoleID 
            });
        }

        // 6. Vincular ID de usuario en la tabla de origen (si aplica)
        if (emp) await supabase.from('employee').update({ UserID: newUser.UserID }).eq('EmpID', emp.EmpID);
        if (grd) await supabase.from('guardian').update({ UserID: newUser.UserID }).eq('GuardianID', grd.GuardianID);

        res.json({ 
            ok: true, 
            message: 'Bienvenido a NiceKids', 
            userId: newUser.UserID 
        });

    } catch (err) {
        console.error("Error syncGoogleUser:", err);
        res.status(500).json({ error: err.message });
    }
};
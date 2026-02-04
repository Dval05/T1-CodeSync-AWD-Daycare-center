import supabase from '../config/supabase.js';




export const provisionUser = async (req, res) => {
    const { type, id, email, firstName, lastName, roleName } = req.body;

    try {
        
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
            
            if (!e.message?.includes('already registered')) throw e;
            
            const { data: existingAuth } = await supabase.auth.admin.listUsers();
            const found = existingAuth.users.find(u => u.email === email);
            if (found) authId = found.id;
        }

        
        const { data: existingUser } = await supabase.from('user').select('UserID').eq('Email', email).maybeSingle();
        let dbUserId = existingUser?.UserID;

        if (dbUserId) {
            
            const updatePayload = { FirstName: firstName, LastName: lastName, IsActive: 1 };
            if (authId) updatePayload.AuthUserID = authId;
            await supabase.from('user').update(updatePayload).eq('UserID', dbUserId);
        } else {
            
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

        
        
        const { data: roleData } = await supabase.from('role').select('RoleID').eq('RoleName', roleName).maybeSingle();
        
        if (roleData) {
            
            await supabase.from('user_role').delete().eq('UserID', dbUserId);
            
            await supabase.from('user_role').insert({ 
                UserID: dbUserId, 
                RoleID: roleData.RoleID,
                AssignedBy: req.user?.internalId || null 
            });
        } else {
            return res.status(400).json({ error: `El rol '${roleName}' no existe en la base de datos.` });
        }

        
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




export const syncGoogleUser = async (req, res) => {
    try {
        
        const { authId } = req.user;
        const { data: { user } } = await supabase.auth.admin.getUserById(authId);
        
        if (!user) return res.status(401).json({ error: 'Usuario no encontrado en Supabase Auth' });

        const email = user.email;
        
        const ADMIN_EMAIL = 'andrade.dval@gmail.com'; 

        
        const { data: existing } = await supabase.from('user').select('UserID, IsActive').eq('AuthUserID', authId).maybeSingle();
        
        if (existing) {
            
            if (existing.IsActive === 0) {
                await supabase.from('user').update({ IsActive: 1 }).eq('UserID', existing.UserID);
            }
            return res.json({ ok: true, message: 'Usuario sincronizado (existente)' });
        }

        
        const { data: emp } = await supabase.from('employee').select('EmpID, FirstName, LastName').eq('Email', email).maybeSingle();
        const { data: grd } = await supabase.from('guardian').select('GuardianID, FirstName, LastName').eq('Email', email).maybeSingle();

        
        
        if (!emp && !grd && email !== ADMIN_EMAIL) {
            
            await supabase.auth.admin.deleteUser(authId);
            return res.status(403).json({ 
                error: 'Acceso denegado. Tu correo no está registrado como personal ni representante.' 
            });
        }

        
        
        const firstName = emp?.FirstName || grd?.FirstName || user.user_metadata?.full_name?.split(' ')[0] || 'Admin';
        const lastName = emp?.LastName || grd?.LastName || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'System';
        
        const username = email.split('@')[0] + Math.floor(Math.random() * 1000);

        
        const { data: newUser, error: insErr } = await supabase.from('user').insert({
            AuthUserID: authId, 
            Email: email, 
            UserName: username,
            FirstName: firstName, 
            LastName: lastName, 
            IsActive: 1
        }).select('UserID').single();

        if (insErr) throw insErr;

        
        let targetRoleName = '';

        if (email === ADMIN_EMAIL) {
            targetRoleName = 'Admin';
        } else if (emp) {
            targetRoleName = 'Empleado'; 
        } else {
            targetRoleName = 'Representante'; 
        }

        
        let { data: r } = await supabase.from('role').select('RoleID').eq('RoleName', targetRoleName).maybeSingle();
        
        
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
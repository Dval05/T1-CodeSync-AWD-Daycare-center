import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../config/supabase.js';

const SALT_ROUNDS = 10;

/**
 * Crear usuario con cédula como contraseña inicial
 */
export const createUser = async (req, res) => {
    try {
        const userData = req.body;

        // Validar que tenga cédula
        if (!userData.IDNumber) {
            return res.status(400).json({ error: 'La cédula es requerida' });
        }

        // Hashear la cédula como contraseña inicial
        const hashedPassword = await bcrypt.hash(userData.IDNumber, SALT_ROUNDS);
        
        // Agregar la contraseña hasheada y marcar que debe cambiarla
        userData.PasswordHash = hashedPassword;
        userData.MustChangePassword = 1; // Campo para indicar que debe cambiar contraseña

        const { data, error } = await supabaseAdmin
            .from('user')
            .insert(userData)
            .select()
            .single();

        if (error) return res.status(400).json({ error: error.message });
        
        // No devolver el hash de contraseña
        delete data.PasswordHash;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Actualizar usuario
 */
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userData = req.body;

        // Si viene PasswordHash en el body, hashearlo
        if (userData.PasswordHash) {
            userData.PasswordHash = await bcrypt.hash(userData.PasswordHash, SALT_ROUNDS);
            // Si cambia manualmente la contraseña, ya no debe cambiarla obligatoriamente
            userData.MustChangePassword = 0;
        }

        const { data, error } = await supabaseAdmin
            .from('user')
            .update(userData)
            .eq('UserID', id)
            .select()
            .single();

        if (error) return res.status(400).json({ error: error.message });
        
        delete data.PasswordHash;
        res.json(data);
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Login de usuario
 */
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }

        // Buscar usuario por UserName o Email
        const { data: user, error } = await supabaseAdmin
            .from('user')
            .select('UserID, UserName, Email, FirstName, LastName, PasswordHash, IsActive, MustChangePassword, IDNumber')
            .or(`UserName.eq.${username},Email.eq.${username}`)
            .eq('IsActive', 1)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.PasswordHash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Actualizar último login
        await supabaseAdmin
            .from('user')
            .update({ LastLogin: new Date().toISOString() })
            .eq('UserID', user.UserID);

        // No devolver el hash
        delete user.PasswordHash;

        res.json({
            success: true,
            user,
            mustChangePassword: user.MustChangePassword === 1
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

/**
 * Cambiar contraseña (forzado o voluntario)
 */
export const changePassword = async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        if (!userId || !currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Obtener usuario
        const { data: user, error } = await supabaseAdmin
            .from('user')
            .select('UserID, PasswordHash, IDNumber')
            .eq('UserID', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, user.PasswordHash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Contraseña actual incorrecta' });
        }

        // Validar que la nueva contraseña no sea igual a la cédula
        if (newPassword === user.IDNumber) {
            return res.status(400).json({ error: 'La nueva contraseña no puede ser tu cédula' });
        }

        // Hashear nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Actualizar contraseña y marcar que ya cambió
        const { error: updateError } = await supabaseAdmin
            .from('user')
            .update({ 
                PasswordHash: hashedPassword,
                MustChangePassword: 0 
            })
            .eq('UserID', userId);

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

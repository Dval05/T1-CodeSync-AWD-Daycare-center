import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../config/supabase.js';

const SALT_ROUNDS = 10;

export const createUserService = async (userData, deps = {}) => {
  const db = deps.db || supabaseAdmin;

  if (!userData?.IDNumber) {
    return { error: new Error('La cédula es requerida') };
  }

  const hashedPassword = await bcrypt.hash(userData.IDNumber, SALT_ROUNDS);
  const payload = {
    ...userData,
    PasswordHash: hashedPassword,
    MustChangePassword: 1,
  };

  const { data, error } = await db.from('user').insert(payload).select().single();
  if (error) return { error };
  if (data) delete data.PasswordHash;
  return { data };
};

export const updateUserService = async (id, partialData, deps = {}) => {
  const db = deps.db || supabaseAdmin;
  const updates = { ...partialData };

  if (updates.PasswordHash) {
    updates.PasswordHash = await bcrypt.hash(updates.PasswordHash, SALT_ROUNDS);
    updates.MustChangePassword = 0;
  }

  const { data, error } = await db
    .from('user')
    .update(updates)
    .eq('UserID', id)
    .select()
    .single();

  if (error) return { error };
  if (data) delete data.PasswordHash;
  return { data };
};

export const loginService = async (email, password, deps = {}) => {
  const db = deps.db || supabaseAdmin;
  if (!email || !password) {
    return { error: new Error('Email y contraseña requeridos') };
  }

  const { data: user, error } = await db
    .from('user')
    .select(
      'UserID, UserName, Email, FirstName, LastName, PasswordHash, IsActive, MustChangePassword, IDNumber'
    )
    .eq('Email', email)
    .eq('IsActive', 1)
    .single();

  if (error || !user) {
    return { error: new Error('Credenciales inválidas') };
  }

  const isValidPassword = await bcrypt.compare(password, user.PasswordHash);
  if (!isValidPassword) {
    return { error: new Error('Credenciales inválidas') };
  }

  await db
    .from('user')
    .update({ LastLogin: new Date().toISOString() })
    .eq('UserID', user.UserID);

  delete user.PasswordHash;
  return { data: { user, mustChangePassword: user.MustChangePassword === 1 } };
};

export const changePasswordService = async (
  { userId, currentPassword, newPassword },
  deps = {}
) => {
  const db = deps.db || supabaseAdmin;

  if (!userId || !currentPassword || !newPassword) {
    return { error: new Error('Todos los campos son requeridos') };
  }
  if (newPassword.length < 6) {
    return { error: new Error('La contraseña debe tener al menos 6 caracteres') };
  }

  const { data: user, error } = await db
    .from('user')
    .select('UserID, PasswordHash, IDNumber')
    .eq('UserID', userId)
    .single();

  if (error || !user) return { error: new Error('Usuario no encontrado') };

  const isValidPassword = await bcrypt.compare(currentPassword, user.PasswordHash);
  if (!isValidPassword) return { error: new Error('Contraseña actual incorrecta') };

  if (newPassword === user.IDNumber) {
    return { error: new Error('La nueva contraseña no puede ser tu cédula') };
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const { error: updateError } = await db
    .from('user')
    .update({ PasswordHash: hashedPassword, MustChangePassword: 0 })
    .eq('UserID', userId);

  if (updateError) return { error: updateError };
  return { data: { success: true } };
};

export const resetPasswordToIDService = async ({ userId }, deps = {}) => {
  const db = deps.db || supabaseAdmin;
  if (!userId) return { error: new Error('userId es requerido') };

  const { data: user, error: fetchError } = await db
    .from('user')
    .select('UserID, IDNumber')
    .eq('UserID', userId)
    .single();

  if (fetchError || !user) return { error: new Error('Usuario no encontrado') };
  if (!user.IDNumber)
    return { error: new Error('El usuario no tiene cédula (IDNumber) registrada') };

  const hashedPassword = await bcrypt.hash(user.IDNumber, SALT_ROUNDS);
  const { error: updateError } = await db
    .from('user')
    .update({ PasswordHash: hashedPassword, MustChangePassword: 1 })
    .eq('UserID', userId);

  if (updateError) return { error: updateError };
  return { data: { success: true } };
};

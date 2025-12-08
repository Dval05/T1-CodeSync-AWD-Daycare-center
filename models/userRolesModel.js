import supabase from './supabaseServerClient.js';

const table = 'user_role';

export async function listUserRoles() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('UserRoleID');
  if (error) throw error;
  return data;
}

export async function getUserRole(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('UserRoleID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createUserRole(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserRole(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('UserRoleID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUserRole(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('UserRoleID', id);
  if (error) throw error;
  return true;
}

import supabase from './supabaseServerClient.js';

const table = 'user';

export async function listUsers() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('UserID');
  if (error) throw error;
  return data;
}

export async function getUser(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('UserID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createUser(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateUser(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('UserID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteUser(id) {
  const { error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('UserID', id);
  if (error) throw error;
  return true;
}

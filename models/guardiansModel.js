import supabase from './supabaseServerClient.js';

const table = 'guardian';

export async function listGuardians() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('GuardianID');
  if (error) throw error;
  return data;
}

export async function getGuardian(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq('GuardianID', id).single();
  if (error) throw error;
  return data;
}

export async function createGuardian(payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateGuardian(id, payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).update(payload).eq('GuardianID', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteGuardian(id) {
  if (!supabase) return false;
  const { error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('GuardianID', id);
  if (error) throw error;
  return true;
}

export async function deactivateGuardian(id) {
  return deleteGuardian(id);
}

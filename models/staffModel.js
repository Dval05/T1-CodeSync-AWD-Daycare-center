import supabase from './supabaseServerClient.js';

const table = 'employee';

export async function listStaff() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('EmpID');
  if (error) throw error;
  return data;
}

export async function getStaff(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq('EmpID', id).single();
  if (error) throw error;
  return data;
}

export async function createStaff(payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateStaff(id, payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).update(payload).eq('EmpID', id).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteStaff(id) {
  if (!supabase) return false;
  const { error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('EmpID', id);
  if (error) throw error;
  return true;
}

export async function deactivateStaff(id) {
  return deleteStaff(id);
}

import supabase from './supabaseServerClient.js';

const table = 'student';

export async function listStudents() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('StudentID');
  if (error) throw error;
  return data;
}

export async function getStudent(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq('StudentID', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createStudent(payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateStudent(id, payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).update(payload).eq('StudentID', id).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id) {
  if (!supabase) return false;
  const { error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('StudentID', id);
  if (error) throw error;
  return true;
}

export async function deactivateStudent(id) {
  return deleteStudent(id);
}



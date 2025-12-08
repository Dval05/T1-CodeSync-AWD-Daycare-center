import supabase from './supabaseServerClient.js';

const table = 'student_guardian';

export async function listStudentGuardians() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('StudentGuardianID');
  if (error) throw error;
  return data;
}

export async function getStudentGuardian(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('StudentGuardianID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createStudentGuardian(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateStudentGuardian(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('StudentGuardianID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteStudentGuardian(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('StudentGuardianID', id);
  if (error) throw error;
  return true;
}

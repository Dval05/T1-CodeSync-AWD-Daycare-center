import supabase from './supabaseServerClient.js';

const table = 'grade';

export async function listGrades() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('GradeID');
  if (error) throw error;
  return data;
}

export async function getGrade(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('GradeID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createGrade(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateGrade(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('GradeID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGrade(id) {
  const { error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('GradeID', id);
  if (error) throw error;
  return true;
}

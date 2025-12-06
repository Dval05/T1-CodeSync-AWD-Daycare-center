import supabase from './supabaseServerClient.js';

const table = 'attendance';

export async function listAttendance() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('AttendanceID');
  if (error) throw error;
  return data;
}

export async function getAttendance(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('AttendanceID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createAttendance(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateAttendance(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('AttendanceID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAttendance(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('AttendanceID', id);
  if (error) throw error;
  return true;
}

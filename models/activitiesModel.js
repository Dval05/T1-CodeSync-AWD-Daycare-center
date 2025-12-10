import supabase from './supabaseServerClient.js';

const table = 'activity';

export async function listActivities() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('ActivityID');
  if (error) throw error;
  return data;
}

export async function listActivitiesByEmp(empId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('EmpID', empId)
    .eq('IsActive', 1)
    .order('ScheduledDate', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getActivity(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('ActivityID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createActivity(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateActivity(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('ActivityID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteActivity(id) {
  const { error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('ActivityID', id);
  if (error) throw error;
  return true;
}

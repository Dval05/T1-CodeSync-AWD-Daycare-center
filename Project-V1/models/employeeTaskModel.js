import supabase from './supabaseServerClient.js';

const table = 'employee_task';


export async function listEmployeeTasks() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('TaskID');

  if (error) throw error;
  return data;
}

export async function getEmployeeTask(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('TaskID', id)
    .single();

  if (error) throw error;
  return data;
}


export async function createEmployeeTask(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}


export async function updateEmployeeTask(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('TaskID', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}


export async function deleteEmployeeTask(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('TaskID', id);

  if (error) throw error;
  return true;
}

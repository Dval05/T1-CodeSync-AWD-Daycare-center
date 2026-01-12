import supabase from './supabaseServerClient.js';

const table = 'session';

export async function listSessions() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('SessionID');
  if (error) throw error;
  return data;
}

export async function getSession(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('SessionID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createSession(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateSession(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('SessionID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSession(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('SessionID', id);

  if (error) throw error;
  return true;
}

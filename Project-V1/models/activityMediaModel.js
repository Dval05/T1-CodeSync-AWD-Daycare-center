import supabase from './supabaseServerClient.js';

const table = 'activity_media';

export async function listActivityMedia() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('MediaID');
  if (error) throw error;
  return data;
}

export async function getActivityMedia(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('MediaID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createActivityMedia(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateActivityMedia(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('MediaID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteActivityMedia(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('MediaID', id);
  if (error) throw error;
  return true;
}

/*
export async function listMediaByActivity(activityId) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('ActivityID', activityId)
    .order('MediaID');
  if (error) throw error;
  return data;
}

export async function deleteMediaByActivity(activityId) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('ActivityID', activityId);
  if (error) throw error;
  return true;
}

*/
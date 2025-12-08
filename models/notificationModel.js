import supabase from "./supabaseServerClient.js";

const table = "notification";


export async function listNotifications() {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("NotificationID");

  if (error) throw error;
  return data;
}


export async function getNotification(id) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("NotificationID", id)
    .single();

  if (error) throw error;
  return data;
}


export async function createNotification(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}


export async function updateNotification(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq("NotificationID", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}


export async function deleteNotification(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("NotificationID", id);

  if (error) throw error;
  return true;
}

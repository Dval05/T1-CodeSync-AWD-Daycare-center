import supabase from './supabaseServerClient.js';

const table = 'role_permission';

export async function listRolePermissions() {
  const { data, error } = await supabase.from(table).select('*').order('RoleID');
  if (error) throw error;
  return data;
}

export async function createRolePermission(payload) {
  const insert = {
    _id: payload._id,
    RoleID: payload.RoleID,
    PermissionID: payload.PermissionID,
  };
  const { data, error } = await supabase.from(table).insert(insert).select('*').single();
  if (error) throw error;
  return data;
}

export async function deleteRolePermission(id) {
  const idNum = Number(id);
  const isNumeric = !Number.isNaN(idNum);
  // If numeric, delete by RoleID; else assume UUID _id
  const { error } = await supabase
    .from(table)
    .delete()
    .eq(isNumeric ? 'RoleID' : '_id', isNumeric ? idNum : id);
  if (error) throw error;
  return true;
}

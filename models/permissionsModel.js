import supabase from './supabaseServerClient.js';

const table = 'permission';

export async function listPermissions() {
  const { data, error } = await supabase.from(table).select('*').order('PermissionID');
  if (error) throw error;
  return data;
}

export async function getPermissionById(id) {
  const idNum = Number(id);
  const isNumeric = !Number.isNaN(idNum);
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(isNumeric ? 'PermissionID' : '_id', isNumeric ? idNum : id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPermission(payload) {
  const insert = {
    _id: payload._id,
    PermissionID: payload.PermissionID,
    PermissionName: payload.PermissionName,
    Description: payload.Description,
    IsActive: payload.IsActive ?? 1,
  };
  const { data, error } = await supabase.from(table).insert(insert).select('*').single();
  if (error) throw error;
  return data;
}

export async function updatePermission(id, payload) {
  const idNum = Number(id);
  const isNumeric = !Number.isNaN(idNum);
  const updateFields = {
    PermissionName: payload.PermissionName,
    Description: payload.Description,
    IsActive: payload.IsActive,
  };
  if (!isNumeric && payload.PermissionID !== undefined) {
    updateFields.PermissionID = payload.PermissionID;
  }
  const { data, error } = await supabase
    .from(table)
    .update(updateFields)
    .eq(isNumeric ? 'PermissionID' : '_id', isNumeric ? idNum : id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

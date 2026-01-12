import supabase from './supabaseServerClient.js';

// Use base table `role` which matches ERD; view `roles` exists for compatibility
const table = 'role';

export async function listRoles() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('RoleID');
  if (error) throw error;
  return data;
}

export async function getRoleById(id) {
  const idNum = Number(id);
  const isNumeric = !Number.isNaN(idNum);
  const query = isNumeric
    ? supabase.from(table).select('*').eq('RoleID', idNum).single()
    : supabase.from(table).select('*').eq('_id', id).single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createRole(payload) {
  const insert = {
    _id: payload._id,
    RoleID: payload.RoleID,
    RoleName: payload.RoleName,
    Description: payload.Description,
    IsActive: payload.IsActive ?? 1,
  };
  const { data, error } = await supabase.from(table).insert(insert).select('*').single();
  if (error) throw error;
  return data;
}

export async function updateRole(id, payload) {
  const idNum = Number(id);
  const isNumeric = !Number.isNaN(idNum);
  const updateFields = {
    RoleName: payload.RoleName,
    Description: payload.Description,
    IsActive: payload.IsActive,
  };
  if (!isNumeric && payload.RoleID !== undefined) {
    updateFields.RoleID = payload.RoleID;
  }
  const { data, error } = await supabase
    .from(table)
    .update(updateFields)
    .eq(isNumeric ? 'RoleID' : '_id', isNumeric ? idNum : id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateRole(id) {
  const idNum = Number(id);
  if (Number.isNaN(idNum)) {
    throw new Error('RoleID must be numeric');
  }
  const { data, error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('RoleID', idNum)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

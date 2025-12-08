import supabase from './supabaseServerClient.js';

const table = 'teacher_payment';

export async function listTeacherPayments() {
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select('*').order('TeacherPaymentID');
  if (error) throw error;
  return data;
}

export async function getTeacherPayment(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq('TeacherPaymentID', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTeacherPayment(payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateTeacherPayment(id, payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).update(payload).eq('TeacherPaymentID', id).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteTeacherPayment(id) {
  if (!supabase) return false;
  const { error } = await supabase.from(table).delete().eq('TeacherPaymentID', id);
  if (error) throw error;
  return true;
}

export default {
  listTeacherPayments,
  getTeacherPayment,
  createTeacherPayment,
  updateTeacherPayment,
  deleteTeacherPayment,
};

import supabase from './supabaseServerClient.js';

const table = 'student_payment';

export async function listStudentPayments() {
  if (!supabase) return [];
  const { data, error } = await supabase.from(table).select('*').order('StudentPaymentID');
  if (error) throw error;
  return data;
}

export async function getStudentPayment(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq('StudentPaymentID', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createStudentPayment(payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateStudentPayment(id, payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).update(payload).eq('StudentPaymentID', id).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteStudentPayment(id) {
  if (!supabase) return false;
  const { error } = await supabase.from(table).delete().eq('StudentPaymentID', id);
  if (error) throw error;
  return true;
}

export default {
  listStudentPayments,
  getStudentPayment,
  createStudentPayment,
  updateStudentPayment,
  deleteStudentPayment,
};

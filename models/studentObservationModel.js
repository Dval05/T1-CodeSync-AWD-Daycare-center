import supabase from './supabaseServerClient.js';

const table = 'student_observation';


export async function createStudentObservation(payload) {
  if (!supabase) return null;

  const { StudentID, AttendanceID } = payload;

 
  const { data: attendance, error: aErr } = await supabase
    .from('attendance')
    .select('AttendanceID')
    .eq('AttendanceID', AttendanceID)
    .eq('StudentID', StudentID)
    .maybeSingle();

  if (aErr) throw aErr;
  if (!attendance) {
    const err = new Error('Observation requires a valid attendance record');
    err.status = 400;
    throw err;
  }

  
  const { data, error } = await supabase
    .from('student_observation')
    .insert(payload)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listStudentObservations() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('ObservationID');

  if (error) throw error;
  return data;
}

export async function getStudentObservation(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('ObservationID', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createStudentObservation(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateStudentObservation(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('ObservationID', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteStudentObservation(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('ObservationID', id);

  if (error) throw error;
  return true;
}

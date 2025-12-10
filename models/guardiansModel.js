import supabase from './supabaseServerClient.js';

const table = 'guardian';

export async function listGuardians() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('GuardianID');
  if (error) throw error;
  return data;
}

export async function getGuardian(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq('GuardianID', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createGuardian(payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateGuardian(id, payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).update(payload).eq('GuardianID', id).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteGuardian(id) {
  if (!supabase) return false;
  const { error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('GuardianID', id);
  if (error) throw error;
  return true;
}

export async function deactivateGuardian(id) {
  return deleteGuardian(id);
}

export async function listStudentsForGuardian(guardianId) {
  if (!supabase) return [];
  // first get links from student_guardian
  const { data: links, error: linkErr } = await supabase
    .from('student_guardian')
    .select('StudentID, Relationship')
    .eq('GuardianID', guardianId);
  if (linkErr) throw linkErr;
  const ids = (links || []).map((r) => r.StudentID).filter(Boolean);
  if (ids.length === 0) return [];

  const { data: students, error: studentsErr } = await supabase
    .from('student')
    .select('StudentID, FirstName, LastName')
    .in('StudentID', ids)
    .eq('IsActive', 1)
    .order('StudentID');
  if (studentsErr) throw studentsErr;
  const relById = (links || []).reduce((acc, r) => {
    if (r && r.StudentID) acc[r.StudentID] = r.Relationship || null;
    return acc;
  }, {});

  return (students || []).map(s => ({
    StudentID: s.StudentID,
    FirstName: s.FirstName,
    LastName: s.LastName,
    Relationship: relById[s.StudentID] ?? null
  }));
}

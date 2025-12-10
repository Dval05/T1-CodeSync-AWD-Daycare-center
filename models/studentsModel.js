import supabase from './supabaseServerClient.js';

const table = 'student';

export async function listStudents() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('IsActive', 1)
    .order('StudentID');
  if (error) throw error;
  return data;
}

export async function getStudent(id) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).select('*').eq('StudentID', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createStudent(payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateStudent(id, payload) {
  if (!supabase) return null;
  const { data, error } = await supabase.from(table).update(payload).eq('StudentID', id).select('*').maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteStudent(id) {
  if (!supabase) return false;
  const { error } = await supabase
    .from(table)
    .update({ IsActive: 0 })
    .eq('StudentID', id);
  if (error) throw error;
  return true;
}

export async function deactivateStudent(id) {
  return deleteStudent(id);
}

export async function listGuardiansForStudent(studentId) {
  if (!supabase) return [];
  const { data: links, error: linkErr } = await supabase
    .from('student_guardian')
    .select('GuardianID, Relationship')
    .eq('StudentID', studentId);
  if (linkErr) throw linkErr;
  const ids = (links || []).map((r) => r.GuardianID).filter(Boolean);
  if (ids.length === 0) return [];

  const { data: guardians, error: gErr } = await supabase
    .from('guardian')
    .select('GuardianID, FirstName, LastName, Relationship')
    .in('GuardianID', ids)
    .eq('IsActive', 1)
    .order('GuardianID');
  if (gErr) throw gErr;

  // map relationship from links into guardians
  const relById = (links || []).reduce((acc, r) => {
    if (r && r.GuardianID) acc[r.GuardianID] = r.Relationship || null;
    return acc;
  }, {});

  return (guardians || []).map(g => ({
    GuardianID: g.GuardianID,
    FirstName: g.FirstName,
    LastName: g.LastName,
    Relationship: relById[g.GuardianID] ?? g.Relationship ?? null
  }));
}

export async function listAttendanceForStudent(studentId, fromDate, toDate) {
  if (!supabase) return [];
  // attendance table uses column "Date" for the attendance date per schema.sql
  let query = supabase.from('attendance').select('*').eq('StudentID', studentId).order('Date', { ascending: true });
  if (fromDate) query = query.gte('Date', fromDate);
  if (toDate) query = query.lte('Date', toDate);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function listPaymentsForStudent(studentId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('student_payment')
    .select('*')
    .eq('StudentID', studentId)
    .order('PaymentDate', { ascending: false });
  if (error) throw error;
  return data;
}

export async function paymentsSummaryForStudent(studentId) {
  if (!supabase) return { total: 0 };
  // student_payment schema uses PaidAmount / TotalAmount fields
  const { data, error } = await supabase
    .from('student_payment')
    .select('PaidAmount, TotalAmount, PaymentDate, StudentPaymentID, Status')
    .eq('StudentID', studentId);
  if (error) throw error;
  const rows = data || [];
  const totalPaid = rows.reduce((s, r) => s + (Number(r.PaidAmount) || 0), 0);
  const totalDue = rows.reduce((s, r) => s + (Number(r.TotalAmount) || 0), 0);
  const balance = totalDue - totalPaid;
  // last payments (by PaymentDate desc)
  const lastPayments = rows
    .slice()
    .sort((a, b) => {
      const ad = a.PaymentDate ? new Date(a.PaymentDate) : new Date(0);
      const bd = b.PaymentDate ? new Date(b.PaymentDate) : new Date(0);
      return bd - ad;
    })
    .slice(0, 5)
    .map(r => ({ StudentPaymentID: r.StudentPaymentID, PaymentDate: r.PaymentDate, PaidAmount: r.PaidAmount, TotalAmount: r.TotalAmount, Status: r.Status }));

  return { totalPaid, totalDue, balance, lastPayments };
}

export async function studentProgressReport(studentId, fromDate, toDate) {
  if (!supabase) return null;

  // attendance summary for the student in the given range
  let aQuery = supabase.from('attendance').select('AttendanceID, Date, Status, CheckInTime').eq('StudentID', studentId);
  if (fromDate) aQuery = aQuery.gte('Date', fromDate);
  if (toDate) aQuery = aQuery.lte('Date', toDate);
  const { data: attRows, error: aErr } = await aQuery.order('Date', { ascending: true });
  if (aErr) throw aErr;
  const rows = attRows || [];
  const totalDays = rows.length;
  const presentDays = rows.filter(r => {
    const status = (r.Status || '').toString().toLowerCase();
    return status === 'present' || r.CheckInTime != null;
  }).length;
  const absentDays = totalDays - presentDays;
  const percentPresent = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 10000) / 100;

  // observations in the same range
  let oQuery = supabase.from('student_observation').select('*').eq('StudentID', studentId).order('ObservationDate', { ascending: false });
  if (fromDate) oQuery = oQuery.gte('ObservationDate', fromDate);
  if (toDate) oQuery = oQuery.lte('ObservationDate', toDate);
  const { data: obsRows, error: oErr } = await oQuery;
  if (oErr) throw oErr;

  return {
    StudentID: studentId,
    totalDays,
    presentDays,
    absentDays,
    percentPresent,
    observations: obsRows || []
  };
}



import supabase from './supabaseServerClient.js';

export async function listAttendanceRecords(fromDate, toDate) {
  if (!supabase) return [];
  let q = supabase.from('attendance').select('*').order('Date', { ascending: true });
  if (fromDate) q = q.gte('Date', fromDate);
  if (toDate) q = q.lte('Date', toDate);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function listLateArrivals(date, thresholdMinutes = 0) {
  if (!supabase) return [];
  let q = supabase.from('attendance').select('*').order('Date', { ascending: true });
  if (date) q = q.eq('Date', date);
  // use OR to include explicit IsLate flag or LateMinutes above threshold
  const orExpr = `"IsLate".eq.1,\"LateMinutes\".gt.${Number(thresholdMinutes)}`;
  const { data, error } = await q.or(orExpr);
  if (error) throw error;
  return data || [];
}

export async function reportAttendance(fromDate, toDate, groupBy = 'student') {
  if (!supabase) return { summary: [] };
  // fetch attendance rows in range
  const rows = await listAttendanceRecords(fromDate, toDate);

  if (groupBy === 'class') {
    // need student GradeID
    const studentIds = Array.from(new Set(rows.map(r => r.StudentID).filter(Boolean)));
    const { data: students } = await supabase.from('student').select('StudentID, GradeID').in('StudentID', studentIds || []);
    const gradeByStudent = (students || []).reduce((acc, s) => { acc[s.StudentID] = s.GradeID; return acc; }, {});

    const groups = {};
    rows.forEach(r => {
      const gid = gradeByStudent[r.StudentID] || null;
      const key = gid === null ? 'unknown' : `grade_${gid}`;
      groups[key] = groups[key] || { GradeID: gid, total: 0, present: 0 };
      groups[key].total += 1;
      const status = (r.Status || '').toString().toLowerCase();
      const present = status === 'Present' || r.CheckInTime != null;
      if (present) groups[key].present += 1;
    });

    const summary = Object.values(groups).map(g => ({
      GradeID: g.GradeID,
      totalDays: g.total,
      presentDays: g.present,
      absentDays: g.total - g.present,
      percentPresent: g.total === 0 ? 0 : Math.round((g.present / g.total) * 10000) / 100
    }));
    return { summary, records: rows };
  }

  // default: groupBy student
  const byStudent = {};
  rows.forEach(r => {
    const sid = r.StudentID;
    if (!byStudent[sid]) byStudent[sid] = { StudentID: sid, total: 0, present: 0 };
    byStudent[sid].total += 1;
    const status = (r.Status || '').toString().toLowerCase();
    const present = status === 'Present' || r.CheckInTime != null;
    if (present) byStudent[sid].present += 1;
  });

  const studentIds = Object.keys(byStudent).map((s) => Number(s)).filter(Boolean);
  let studentsMap = {};
  if (studentIds.length > 0) {
    const { data: students } = await supabase.from('student').select('StudentID, FirstName, LastName').in('StudentID', studentIds);
    studentsMap = (students || []).reduce((acc, s) => { acc[s.StudentID] = s; return acc; }, {});
  }

  const summary = Object.values(byStudent).map(g => {
    const s = studentsMap[g.StudentID] || {};
    return {
      StudentID: g.StudentID,
      FirstName: s.FirstName || null,
      LastName: s.LastName || null,
      totalDays: g.total,
      presentDays: g.present,
      absentDays: g.total - g.present,
      percentPresent: g.total === 0 ? 0 : Math.round((g.present / g.total) * 10000) / 100
    };
  });

  return { summary, records: rows };
}

export default { listAttendanceRecords, reportAttendance };

const table = 'attendance';

export async function listAttendance() {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('AttendanceID');
  if (error) throw error;
  return data;
}

export async function getAttendance(id) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('AttendanceID', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createAttendance(payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateAttendance(id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('AttendanceID', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAttendance(id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('AttendanceID', id);
  if (error) throw error;
  return true;
}

export async function getMonthlyAttendanceSummary(studentId, year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;

  // Fin del mes (último día)
  const endDateObj = new Date(Date.UTC(year, month, 0));
  const endDate = endDateObj.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("attendance")
    .select("Status, IsLate")
    .eq("StudentID", studentId)
    .gte("Date", startDate)
    .lte("Date", endDate);

  if (error) throw error;

  let present = 0;
  let absent = 0;
  let late = 0;

  data.forEach((row) => {
    if (row.Status === "Present") present++;
    if (row.Status === "Absent") absent++;
    if (row.IsLate === 1) late++;
  });

  const total = present + absent;

  const percentPresent = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

  return {
    studentId,
    year,
    month,
    present,
    absent,
    late,
    percentPresent,
    totalRecords: total
  };
}

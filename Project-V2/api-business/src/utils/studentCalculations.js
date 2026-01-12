const MS_PER_DAY = 1000 * 60 * 60 * 24;

function normalizeDateUTC(input) {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function startOfTodayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function diffYMD(fromDate, toDate) {
  let years = toDate.getUTCFullYear() - fromDate.getUTCFullYear();
  let months = toDate.getUTCMonth() - fromDate.getUTCMonth();
  let days = toDate.getUTCDate() - fromDate.getUTCDate();

  if (days < 0) {
    const lastDayOfPrevMonth = new Date(Date.UTC(toDate.getUTCFullYear(), toDate.getUTCMonth(), 0));
    days += lastDayOfPrevMonth.getUTCDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days };
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function calculateStudyTime(enrollmentDateInput) {
  const enrollmentDate = normalizeDateUTC(enrollmentDateInput);
  if (!enrollmentDate) throw new Error('Invalid enrollment date');

  const today = startOfTodayUTC();
  // Validar futuro (opcional, comentado si quieres permitir fechas futuras)
  // if (enrollmentDate > today) throw new Error('Enrollment date is in the future');

  const period = diffYMD(enrollmentDate, today);
  const totalDays = Math.floor((today.getTime() - enrollmentDate.getTime()) / MS_PER_DAY);

  return { ...period, totalDays, since: toISODate(enrollmentDate), asOf: toISODate(today) };
}

export function calculateAge(birthDateInput) {
  const birthDate = normalizeDateUTC(birthDateInput);
  if (!birthDate) throw new Error('Invalid birth date');

  const today = startOfTodayUTC();
  if (birthDate > today) throw new Error('Birth date is in the future');

  const period = diffYMD(birthDate, today);
  const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / MS_PER_DAY);

  return { ...period, totalDays, birthDate: toISODate(birthDate), asOf: toISODate(today) };
}

export function daysUntilBirthday(birthDateInput) {
  const birthDate = normalizeDateUTC(birthDateInput);
  if (!birthDate) throw new Error('Invalid birth date');

  const today = startOfTodayUTC();
  let nextBirthday = new Date(Date.UTC(today.getUTCFullYear(), birthDate.getUTCMonth(), birthDate.getUTCDate()));

  if (nextBirthday < today) {
    nextBirthday = new Date(Date.UTC(today.getUTCFullYear() + 1, birthDate.getUTCMonth(), birthDate.getUTCDate()));
  }

  const daysUntil = Math.round((nextBirthday.getTime() - today.getTime()) / MS_PER_DAY);

  return { daysUntil, nextBirthday: toISODate(nextBirthday), asOf: toISODate(today) };
}
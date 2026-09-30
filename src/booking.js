// Office hours and appointment availability. All dates are calendar dates in Kigali (UTC+2).

const TIMEZONE = 'Africa/Kigali';
const MAX_DAYS_AHEAD = 60;

// One-hour appointment slots. Weekdays: 8 AM – 6 PM with a lunch break at 1 PM.
// Saturday: 9 AM – 2 PM. Sunday: closed.
const WEEKDAY_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00'
];
const SATURDAY_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayInKigali(now = new Date()) {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(now);
}

function addDays(dateStr, days) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function isValidDate(dateStr) {
  if (typeof dateStr !== 'string' || !DATE_RE.test(dateStr)) return false;
  const d = new Date(`${dateStr}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

function dayOfWeek(dateStr) {
  return new Date(`${dateStr}T12:00:00Z`).getUTCDay(); // 0 = Sunday
}

function slotsForDate(dateStr) {
  const day = dayOfWeek(dateStr);
  if (day === 0) return [];
  if (day === 6) return SATURDAY_SLOTS;
  return WEEKDAY_SLOTS;
}

function bookingWindow(now = new Date()) {
  const today = todayInKigali(now);
  return { min: addDays(today, 1), max: addDays(today, MAX_DAYS_AHEAD) };
}

// Returns an error message, or null if appointments can be booked on this date
function checkBookableDate(dateStr, now = new Date()) {
  if (!isValidDate(dateStr)) return 'Please choose a valid date.';
  const { min, max } = bookingWindow(now);
  if (dateStr < min) return 'Please choose a date from tomorrow onwards.';
  if (dateStr > max) return `Appointments can be booked up to ${MAX_DAYS_AHEAD} days ahead.`;
  if (dayOfWeek(dateStr) === 0) return 'We are closed on Sundays. Please choose another day.';
  return null;
}

function availableSlots(db, dateStr, now = new Date()) {
  const error = checkBookableDate(dateStr, now);
  if (error) return { date: dateStr, open: false, reason: error, slots: [] };

  const taken = new Set(
    db
      .prepare(
        `SELECT time FROM appointments WHERE date = ? AND status IN ('pending', 'confirmed')`
      )
      .pluck()
      .all(dateStr)
  );
  const slots = slotsForDate(dateStr).map((time) => ({ time, available: !taken.has(time) }));
  return { date: dateStr, open: true, slots };
}

module.exports = {
  MAX_DAYS_AHEAD,
  WEEKDAY_SLOTS,
  SATURDAY_SLOTS,
  todayInKigali,
  addDays,
  isValidDate,
  slotsForDate,
  bookingWindow,
  checkBookableDate,
  availableSlots
};

const { test } = require('node:test');
const assert = require('node:assert/strict');
const booking = require('../src/booking');
const { openDatabase } = require('../src/db');

// Wednesday 30 Sept 2026, 10:00 in Kigali
const NOW = new Date('2026-09-30T08:00:00Z');

test('today is calculated in Kigali time, not UTC', () => {
  // 23:30 UTC on 30 Sept is already 01:30 on 1 Oct in Kigali
  assert.equal(booking.todayInKigali(new Date('2026-09-30T23:30:00Z')), '2026-10-01');
  assert.equal(booking.todayInKigali(NOW), '2026-09-30');
});

test('office hours: weekdays, Saturday morning, closed Sunday', () => {
  assert.deepEqual(booking.slotsForDate('2026-10-05'), booking.WEEKDAY_SLOTS); // Monday
  assert.deepEqual(booking.slotsForDate('2026-10-03'), booking.SATURDAY_SLOTS); // Saturday
  assert.deepEqual(booking.slotsForDate('2026-10-04'), []); // Sunday
  assert.ok(!booking.SATURDAY_SLOTS.some((t) => t >= '14:00'), 'Saturday closes at 2 PM');
});

test('bookable dates start tomorrow and end 60 days ahead', () => {
  assert.match(booking.checkBookableDate('2026-09-30', NOW), /tomorrow/);
  assert.equal(booking.checkBookableDate('2026-10-01', NOW), null);
  assert.equal(booking.checkBookableDate('2026-11-28', NOW), null); // Saturday, day 59
  assert.match(booking.checkBookableDate('2026-11-30', NOW), /60 days/);
});

test('Sundays and invalid dates are rejected', () => {
  assert.match(booking.checkBookableDate('2026-10-04', NOW), /Sundays/);
  assert.match(booking.checkBookableDate('2026-02-30', NOW), /valid date/);
  assert.match(booking.checkBookableDate('next week', NOW), /valid date/);
});

test('booked slots are marked unavailable, cancelled ones are free again', () => {
  const db = openDatabase(':memory:');
  const insert = db.prepare(
    `INSERT INTO appointments (full_name, phone, service, date, time, status)
     VALUES ('Test', '+250788000000', 'notarial', '2026-10-01', ?, ?)`
  );
  insert.run('09:00', 'confirmed');
  insert.run('10:00', 'cancelled');

  const result = booking.availableSlots(db, '2026-10-01', NOW);
  assert.equal(result.open, true);
  const byTime = Object.fromEntries(result.slots.map((s) => [s.time, s.available]));
  assert.equal(byTime['09:00'], false);
  assert.equal(byTime['10:00'], true);
});

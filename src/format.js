// SQLite stores datetime('now') as UTC "YYYY-MM-DD HH:MM:SS"; staff read times in Kigali time
const kigaliFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Kigali',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});

function formatDateTime(sqliteUtc) {
  if (!sqliteUtc) return '';
  const date = new Date(`${sqliteUtc.replace(' ', 'T')}Z`);
  return Number.isNaN(date.getTime()) ? sqliteUtc : kigaliFormat.format(date);
}

module.exports = { formatDateTime };

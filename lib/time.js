// Robust IST (Asia/Kolkata) helpers using Intl, so results are correct
// regardless of the visitor's own browser/system timezone. The previous
// approach manually combined getTime() with getTimezoneOffset(), which
// only happened to work for visitors already in IST and gave wrong
// results for anyone browsing from outside India.

function getISTFormatParts(options) {
  const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', ...options });
  const parts = fmt.formatToParts(new Date());
  const map = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });
  return map;
}

// Returns { time: "09:15", ampm: "AM" } in IST, for clock displays.
export function getISTClockParts() {
  const map = getISTFormatParts({ hour: '2-digit', minute: '2-digit', hour12: true, hourCycle: 'h12' });
  return { time: `${map.hour}:${map.minute}`, ampm: (map.dayPeriod || '').toUpperCase() };
}

// Returns current IST hour (0-23) and minute, for open/closed comparisons.
export function getISTHourMinute24() {
  const map = getISTFormatParts({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  return { hour: parseInt(map.hour, 10), minute: parseInt(map.minute, 10) };
}

// Compares current IST time against "HH:MM" open/close strings.
export function isShopOpenNow(openTime, closeTime) {
  try {
    const { hour, minute } = getISTHourMinute24();
    const nowMinutes = hour * 60 + minute;
    const [oh, om] = (openTime || '09:00').split(':').map(Number);
    const [ch, cm] = (closeTime || '21:30').split(':').map(Number);
    const openMinutes = oh * 60 + om;
    const closeMinutes = ch * 60 + cm;
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  } catch (e) {
    return true; // fail open rather than showing an incorrect "closed" badge
  }
}

// Formats "21:30" -> "9:30 PM" for display.
export function formatTimeLabel(hhmm) {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return '';
  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  hour12 = hour12 ? hour12 : 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

// Builds the /calendar grid and the start dates from src/data/school-calendar.json.
// All date math is in UTC on ISO strings, so the build machine's timezone never shifts a day.
import data from '../data/school-calendar.json';

const DAY = 86400000;
const toDate = (iso) => new Date(`${iso}T00:00:00Z`);
const toIso = (d) => d.toISOString().slice(0, 10);
const addDays = (iso, n) => toIso(new Date(toDate(iso).getTime() + n * DAY));
const weekday = (iso) => toDate(iso).getUTCDay(); // 0 = Sun … 6 = Sat
const isWeekend = (iso) => [0, 6].includes(weekday(iso));
/** Step back n business days (Mon–Fri) — the last day a family can sign for a given start. */
const subBusinessDays = (iso, n) => {
  let d = iso;
  while (n > 0) {
    d = addDays(d, -1);
    if (!isWeekend(d)) n -= 1;
  }
  return d;
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = MONTHS.map((m) => m.slice(0, 3));
export const formatDay = (iso) => {
  const d = toDate(iso);
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]}`;
};

const closed = new Set(data.nonSchoolDays.map((d) => d.date));
// A biome runs from its first day to its showcase (the last day of the unit).
const biomes = data.biomes.map((b) => ({ ...b, end: b.showcase }));
const biomeOn = (iso) => biomes.find((b) => iso >= b.start && iso <= b.end);

/** The rolling-enrollment rules from Slack (#strategy 2026-09-14), applied per biome.
 *  Rolling Wednesdays stop after `rollingUntil`; from then on only biome starts are intakes. */
function computeStartDates() {
  const rules = data.startDates;
  const list = [];
  for (const b of biomes) {
    if (rules.includeBiomeStart) list.push({ iso: b.start, biome: b.name, type: 'biome' });
    const weds = [];
    for (let iso = b.start; iso <= b.end; iso = addDays(iso, 1)) {
      if (weekday(iso) !== rules.weekday) continue;
      if (closed.has(iso) || iso === b.end || iso === b.start) continue;
      weds.push(iso);
    }
    weds.pop(); // the last remaining Wednesday is closed: a new child would get one week, then a break
    for (const iso of weds) {
      if (rules.rollingUntil && iso > rules.rollingUntil) continue; // after it, biome starts only
      list.push({ iso, biome: b.name, type: 'rolling' });
    }
  }
  return list;
}

const startList = (data.startDates.override ?? computeStartDates()).map((s) => ({
  ...s,
  signBy: subBusinessDays(s.iso, data.startDates.signByBusinessDays),
}));
const startByIso = new Map(startList.map((s) => [s.iso, s]));

export const startDates = startList;

/** Twelve month grids, Monday-first, exactly as the printed calendar lays them out. */
export function calendarMonths() {
  const [fy, fm] = data.firstMonth.split('-').map(Number);
  const [ly, lm] = data.lastMonth.split('-').map(Number);
  const months = [];
  for (let y = fy, m = fm; y < ly || (y === ly && m <= lm); m === 12 ? ((y += 1), (m = 1)) : (m += 1)) {
    const first = `${y}-${String(m).padStart(2, '0')}-01`;
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = [];
    for (let d = 1; d <= days; d++) {
      const iso = addDays(first, d - 1);
      const b = biomeOn(iso);
      let kind = null;
      if (b && !isWeekend(iso) && !closed.has(iso)) {
        kind = iso === b.start ? 'start' : iso === b.showcase ? 'showcase' : 'unit';
      }
      const s = startByIso.get(iso);
      cells.push({
        day: d,
        iso,
        weekend: isWeekend(iso),
        kind,
        biome: kind ? b : null,
        start: s ? { ...s, label: formatDay(s.iso), signByLabel: formatDay(s.signBy), color: biomeOn(iso).color, stroke: biomeOn(iso).stroke } : null,
      });
    }
    months.push({
      name: MONTHS[m - 1],
      lead: (weekday(first) + 6) % 7, // blanks before the 1st, Monday-first
      cells,
      biomeStarts: biomes.filter((b) => b.start.startsWith(first.slice(0, 7))),
    });
  }
  return months;
}

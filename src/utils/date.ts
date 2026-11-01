const UTC = 'UTC';

export function isoDate(date: Date = new Date(), timeZone?: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Parses YYYY-MM-DD at UTC noon so date maths never crosses a DST edge. */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 12));
}

export function addDays(iso: string, days: number): string {
  const next = parseISODate(iso);
  next.setUTCDate(next.getUTCDate() + days);
  return isoDate(next, UTC);
}

export function lastNDates(count: number, todayISO: string): string[] {
  return Array.from({ length: count }, (_, index) => addDays(todayISO, index - (count - 1)));
}

export function weekdayShort(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: UTC }).format(
    parseISODate(iso)
  );
}

export function dayOfMonth(iso: string): number {
  return Number(iso.slice(8, 10));
}

export function formatFullDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: UTC,
  }).format(parseISODate(iso));
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: UTC,
  }).format(parseISODate(iso));
}

/** Monday-first week containing the given date. */
export function weekDates(todayISO: string): string[] {
  const weekday = parseISODate(todayISO).getUTCDay();
  const offsetToMonday = (weekday + 6) % 7;
  const monday = addDays(todayISO, -offsetToMonday);

  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function relativeDay(iso: string, todayISO: string): string {
  if (iso === todayISO) {
    return 'Today';
  }
  if (iso === addDays(todayISO, -1)) {
    return 'Yesterday';
  }
  return formatShortDate(iso);
}

/**
 * The IANA zone the device is set to. The server is authoritative for
 * streaks, so this is only used to stamp completions and to label dates.
 */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function timeZoneLabel(timeZone: string): string {
  return timeZone.replace(/_/g, ' ');
}

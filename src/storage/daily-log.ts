import { StorageKeys } from '@/constants/config';
import { kv } from '@/storage/kv';

type DailyLog = Record<string, number>;

type StoredLog = {
  date: string;
  entries: DailyLog;
};

/**
 * The Go dashboard hard-codes `qty_achieved_today` to zero, so a reload would
 * otherwise forget how much the user logged. This keeps today's quantities on
 * the device, keyed by date, and the UI overlays them on the server answer.
 */
function readStored(): StoredLog | null {
  const raw = kv.getString(StorageKeys.dailyLog);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredLog;

    if (!parsed?.date || typeof parsed.entries !== 'object' || parsed.entries === null) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function write(log: StoredLog) {
  kv.set(StorageKeys.dailyLog, JSON.stringify(log));
}

export const dailyLog = {
  read(date: string): DailyLog {
    const stored = readStored();
    return stored && stored.date === date ? stored.entries : {};
  },
  set(date: string, habitId: string, qty: number) {
    const stored = readStored();
    const entries = stored && stored.date === date ? stored.entries : {};

    entries[habitId] = Math.max(entries[habitId] ?? 0, qty);
    write({ date, entries });
  },
  remove(date: string, habitId: string) {
    const stored = readStored();

    if (!stored || stored.date !== date) {
      return;
    }

    delete stored.entries[habitId];
    write(stored);
  },
  clear() {
    kv.remove(StorageKeys.dailyLog);
  },
};

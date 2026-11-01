import type { AuthUser } from '@/types/auth';
import type { Habit, HabitType } from '@/types/habit';

/**
 * The Go handlers return a mix of snake_case DTOs and raw ent structs
 * (PascalCase, because ent emits no json tags). Normalising in one place
 * keeps that inconsistency out of the UI.
 */
type Loose = Record<string, unknown>;

function pick<T>(source: Loose, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) {
      return source[key] as T;
    }
  }
  return undefined;
}

export function normalizeUser(raw: unknown): AuthUser | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const source = raw as Loose;
  const id = pick<string>(source, 'id', 'ID');

  if (!id) {
    return null;
  }

  return {
    id,
    email: pick<string>(source, 'email', 'Email') ?? '',
    display_name: pick<string>(source, 'display_name', 'DisplayName') ?? 'You',
    avatar_url: pick<string>(source, 'avatar_url', 'AvatarUrl', 'AvatarURL') ?? null,
    provider: pick<string>(source, 'provider', 'Provider', 'auth_provider') ?? 'EMAIL',
    time_zone: pick<string>(source, 'time_zone', 'TimeZone', 'timezone'),
    freeze_balance: pick<number>(source, 'freeze_balance', 'FreezeBalance'),
  };
}

export function normalizeHabit(raw: unknown): Habit {
  const source = (raw ?? {}) as Loose;

  return {
    id: pick<string>(source, 'id', 'ID') ?? '',
    user_id: pick<string>(source, 'user_id', 'UserID'),
    title: pick<string>(source, 'title', 'Title') ?? 'Untitled habit',
    type: (pick<string>(source, 'type', 'Type') ?? 'BOOLEAN') as HabitType,
    target_qty: pick<number>(source, 'target_qty', 'TargetQty') ?? null,
    mvt_qty: pick<number>(source, 'mvt_qty', 'MvtQty', 'mvtqty') ?? null,
    unit: pick<string>(source, 'unit', 'Unit') ?? null,
    is_archived: pick<boolean>(source, 'is_archived', 'IsArchived') ?? false,
  };
}

export function normalizeHabits(raw: unknown): Habit[] {
  return Array.isArray(raw) ? raw.map(normalizeHabit) : [];
}

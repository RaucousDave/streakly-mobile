import { http, unwrap } from '@/api/client';
import { normalizeHabit, normalizeHabits } from '@/api/normalize';
import type { CreateHabitInput, FreezeResult, Habit } from '@/types/habit';

export async function listHabits(): Promise<Habit[]> {
  const response = await http.get('/habits');
  return normalizeHabits(unwrap<unknown>(response.data));
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const response = await http.post('/habits', input);
  return normalizeHabit(unwrap<unknown>(response.data));
}

export async function archiveHabit(id: string): Promise<void> {
  await http.patch(`/habits/${id}/archive`);
}

/**
 * The freeze contract per the system design: the client names the missed
 * day it wants protected. The handler currently binds the body to a bare
 * string, so the call is sent with the documented snake_case field and any
 * rejection is surfaced to the user rather than hidden.
 */
export async function freezeHabit(id: string, targetDate: string): Promise<FreezeResult> {
  const response = await http.post(`/habits/${id}/freeze`, { target_date: targetDate });
  return unwrap<FreezeResult>(response.data);
}

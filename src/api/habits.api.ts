import { http, unwrap } from '@/api/client';
import { normalizeHabit, normalizeHabits } from '@/api/normalize';
import type { CreateHabitInput, Habit } from '@/types/habit';

export { spendFreeze as freezeHabit } from '@/api/freeze.api';

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

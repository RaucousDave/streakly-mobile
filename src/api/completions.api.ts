import { http, unwrap } from '@/api/client';
import type { HabitCompletionInput } from '@/types/habit';

export async function syncCompletions(batch: HabitCompletionInput[]): Promise<number> {
  if (batch.length === 0) {
    return 0;
  }

  const response = await http.post('/completions', batch);
  const synced = unwrap<number>(response.data);
  return typeof synced === 'number' ? synced : batch.length;
}

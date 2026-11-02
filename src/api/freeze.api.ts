import { http, unwrap } from '@/api/client';
import type { FreezeResult } from '@/types/habit';

/**
 * Spends one freeze token protecting a missed day for the given habit.
 * The `target_date` must be a YYYY-MM-DD string (typically yesterday).
 */
export async function spendFreeze(habitId: string, targetDate: string): Promise<FreezeResult> {
  const response = await http.post(`/habits/${habitId}/freeze`, { target_date: targetDate });
  return unwrap<FreezeResult>(response.data);
}

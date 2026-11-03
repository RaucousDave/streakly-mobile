import { useQuery } from '@tanstack/react-query';

import { getDashboard } from '@/api/dashboard.api';
import { queryKeys } from '@/api/query-keys';
import { completionQueue } from '@/storage/queue';
import { dailyLog } from '@/storage/daily-log';
import type { DashboardResponse, HabitDashboardItem, HeatmapEntry } from '@/types/habit';

function overlay(habit: HabitDashboardItem, localQty: number): HabitDashboardItem {
  if (localQty <= 0) {
    return habit;
  }

  const isQuantity = habit.type === 'QUANTITATIVE';
  const target = habit.target_qty ?? 0;
  const mvt = habit.mvt_qty ?? 0;
  const qty = Math.max(habit.qty_achieved_today, localQty);

  return {
    ...habit,
    is_completed_today: true,
    qty_achieved_today: isQuantity ? qty : Math.max(1, qty),
    is_mvt_met_today: isQuantity ? qty >= mvt : true,
    is_target_met_today: isQuantity ? qty >= target : true,
  };
}

/**
 * Applies what this phone knows about today on top of the server answer.
 * Necessary because the dashboard currently reports zero quantity for the
 * day even after a successful check-in.
 */
export function overlayToday(data: DashboardResponse): DashboardResponse {
  const date = data.today.date;
  const logged = dailyLog.read(date);
  const queued = completionQueue.read().filter((entry) => entry.completed_date === date);

  if (Object.keys(logged).length === 0 && queued.length === 0) {
    return data;
  }

  const localQty = new Map<string, number>(Object.entries(logged));

  for (const entry of queued) {
    localQty.set(entry.habit_id, Math.max(localQty.get(entry.habit_id) ?? 0, entry.qty_achieved));
  }

  const habits = data.today.habits.map((habit) => overlay(habit, localQty.get(habit.id) ?? 0));

  const completedToday = habits.filter((habit) => habit.is_completed_today).length;
  const hasTodayEntry = data.heatmap_entry.some((entry) => entry.date === date);
  const heatmap_entry: HeatmapEntry[] = hasTodayEntry
    ? data.heatmap_entry.map((entry) =>
        entry.date === date
          ? {
              ...entry,
              completed: completedToday > 0,
              completed_count: Math.max(entry.completed_count, completedToday),
              total: Math.max(entry.total, habits.length),
            }
          : entry
      )
    : [
        ...data.heatmap_entry,
        {
          date,
          completed: completedToday > 0,
          completed_count: completedToday,
          total: habits.length,
        },
      ];

  return {
    ...data,
    today: { ...data.today, habits },
    heatmap_entry,
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboard,
    select: overlayToday,
    staleTime: 60_000,
    retry: 2,
  });
}

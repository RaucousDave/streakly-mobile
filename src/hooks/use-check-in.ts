import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncCompletions } from '@/api/completions.api';
import { toApiError } from '@/api/client';
import { queryKeys } from '@/api/query-keys';
import { completionQueue } from '@/storage/queue';
import { dailyLog } from '@/storage/daily-log';
import type { DashboardResponse, HabitDashboardItem, HeatmapEntry } from '@/types/habit';
import { isoDate } from '@/utils/date';
import { newIdempotencyKey } from '@/utils/idempotency';
import { deviceTimeZone } from '@/utils/timezone';

export type CheckInResult = 'synced' | 'queued';

type CheckInVariables = {
  habit: HabitDashboardItem;
  /** Quantity for quantitative habits; ignored for boolean habits. */
  qty?: number;
};

type Context = {
  previous?: DashboardResponse;
  date: string;
};

function amountFor(habit: HabitDashboardItem, qty?: number): number {
  if (habit.type !== 'QUANTITATIVE') {
    return 1;
  }

  const fallback = habit.mvt_qty ?? 1;
  return Math.max(1, Math.round(qty ?? fallback));
}

function applyOptimistic(
  data: DashboardResponse,
  habit: HabitDashboardItem,
  qty: number
): DashboardResponse {
  const existing = data.today.habits.find((item) => item.id === habit.id);

  if (!existing || existing.is_completed_today) {
    return data;
  }

  const isQuantity = existing.type === 'QUANTITATIVE';
  const target = existing.target_qty ?? 0;
  const mvt = existing.mvt_qty ?? 0;

  const habits = data.today.habits.map((item) =>
    item.id === habit.id
      ? {
          ...item,
          is_completed_today: true,
          qty_achieved_today: isQuantity ? qty : 1,
          is_mvt_met_today: isQuantity ? qty >= mvt : true,
          is_target_met_today: isQuantity ? qty >= target : true,
          current_streak: item.current_streak + 1,
        }
      : item
  );

  const completedToday = habits.filter((item) => item.is_completed_today).length;
  const date = data.today.date;
  const hasTodayEntry = data.heatmap_entry.some((entry) => entry.date === date);

  const heatmap_entry: HeatmapEntry[] = hasTodayEntry
    ? data.heatmap_entry.map((entry) =>
        entry.date === date
          ? {
              ...entry,
              completed: true,
              completed_count: Math.max(entry.completed_count, completedToday),
              total: Math.max(entry.total, habits.length),
            }
          : entry
      )
    : [
        ...data.heatmap_entry,
        { date, completed: true, completed_count: completedToday, total: habits.length },
      ];

  return { ...data, today: { ...data.today, habits }, heatmap_entry };
}

/**
 * One check-in per habit per day. The server has no update or delete route and
 * enforces a unique (habit_id, completed_date) pair, so a quantitative habit
 * is logged once and then locks until tomorrow.
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation<CheckInResult, unknown, CheckInVariables, Context>({
    mutationFn: async ({ habit, qty }) => {
      const dashboard = queryClient.getQueryData<DashboardResponse>(queryKeys.dashboard);
      const date = dashboard?.today.date ?? isoDate(new Date(), deviceTimeZone());
      const amount = amountFor(habit, qty);
      const payload = {
        habit_id: habit.id,
        completed_date: date,
        completed_at_utc: new Date().toISOString(),
        qty_achieved: amount,
        idempotency_key: newIdempotencyKey(),
      };

      try {
        await syncCompletions([payload]);
        completionQueue.remove(habit.id, date);
        return 'synced';
      } catch (error) {
        const apiError = toApiError(error);

        // No connection or a server fault: the tap is kept on the phone and
        // replayed by the sync worker. Validation errors are surfaced instead.
        if (apiError.status === 0 || apiError.status >= 500) {
          completionQueue.enqueue({
            ...payload,
            habit_title: habit.title,
            queued_at: new Date().toISOString(),
          });
          return 'queued';
        }

        throw error;
      }
    },
    onMutate: async ({ habit, qty }) => {
      const dashboard = queryClient.getQueryData<DashboardResponse>(queryKeys.dashboard);
      const date = dashboard?.today.date ?? isoDate(new Date(), deviceTimeZone());
      const amount = amountFor(habit, qty);

      await queryClient.cancelQueries({ queryKey: queryKeys.dashboard });

      const previous = queryClient.getQueryData<DashboardResponse>(queryKeys.dashboard);

      if (previous) {
        queryClient.setQueryData<DashboardResponse>(queryKeys.dashboard, (current) =>
          current ? applyOptimistic(current, habit, amount) : current
        );
      }

      dailyLog.set(date, habit.id, amount);

      return { previous, date };
    },
    onError: (_error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.dashboard, context.previous);
      }

      if (context?.date) {
        dailyLog.remove(context.date, variables.habit.id);
      }
    },
  });
}

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { toApiError } from '@/api/client';
import { syncCompletions } from '@/api/completions.api';
import { queryKeys } from '@/api/query-keys';
import { completionQueue, type QueuedCompletion } from '@/storage/queue';
import type { HabitCompletionInput } from '@/types/habit';

const SYNC_INTERVAL = 30_000;

function toPayload(entry: QueuedCompletion): HabitCompletionInput {
  return {
    habit_id: entry.habit_id,
    completed_date: entry.completed_date,
    completed_at_utc: entry.completed_at_utc,
    qty_achieved: entry.qty_achieved,
    idempotency_key: entry.idempotency_key,
  };
}

function isRejection(error: unknown): boolean {
  const status = toApiError(error).status;
  return status >= 400 && status < 500;
}

/**
 * Replays check-ins made while the phone was offline. It runs on mount, when
 * the app comes back to the foreground, every 30 seconds and when a browser
 * regains its connection.
 *
 * A batch can be refused because one entry is stale, so a rejection falls back
 * to sending entries one at a time: accepted entries leave the queue, entries
 * the server explicitly refuses are dropped, and network failures stop the run
 * so nothing is lost.
 */
export function useOfflineSync() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(() => completionQueue.read().length);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    return completionQueue.subscribe((queue) => setPending(queue.length));
  }, []);

  const flush = useCallback(async () => {
    if (syncingRef.current) {
      return;
    }

    const queue = completionQueue.read();

    if (queue.length === 0) {
      return;
    }

    syncingRef.current = true;
    setSyncing(true);
    let changed = false;

    try {
      await syncCompletions(queue.map(toPayload));

      for (const entry of queue) {
        completionQueue.remove(entry.habit_id, entry.completed_date);
      }

      changed = true;
    } catch (error) {
      if (isRejection(error)) {
        for (const entry of queue) {
          try {
            await syncCompletions([toPayload(entry)]);
            completionQueue.remove(entry.habit_id, entry.completed_date);
            changed = true;
          } catch (innerError) {
            if (isRejection(innerError)) {
              completionQueue.remove(entry.habit_id, entry.completed_date);
              changed = true;
              continue;
            }

            break;
          }
        }
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }

    if (changed) {
      // The server is now authoritative for streaks, so pull the fresh board.
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    }
  }, [queryClient]);

  useEffect(() => {
    // Deferred so the first sync pass never schedules state updates mid-render.
    const initial = setTimeout(() => {
      void flush();
    }, 0);

    const interval = setInterval(() => {
      void flush();
    }, SYNC_INTERVAL);

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void flush();
      }
    });

    let detachOnline: (() => void) | undefined;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onOnline = () => {
        void flush();
      };

      window.addEventListener('online', onOnline);
      detachOnline = () => window.removeEventListener('online', onOnline);
    }

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      subscription.remove();
      detachOnline?.();
    };
  }, [flush]);

  return { pending, syncing, flush };
}

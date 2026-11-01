import { StorageKeys } from '@/constants/config';
import { kv } from '@/storage/kv';
import type { HabitCompletionInput } from '@/types/habit';

export type QueuedCompletion = HabitCompletionInput & {
  habit_title: string;
  queued_at: string;
};

type Listener = (queue: QueuedCompletion[]) => void;

const listeners = new Set<Listener>();

function read(): QueuedCompletion[] {
  const raw = kv.getString(StorageKeys.queue);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as QueuedCompletion[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(queue: QueuedCompletion[]) {
  kv.set(StorageKeys.queue, JSON.stringify(queue));
  listeners.forEach((listener) => listener(queue));
}

export const completionQueue = {
  read,
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /**
   * One pending entry per habit per calendar day. A second tap the same day
   * replaces the queued quantity instead of stacking duplicate rows.
   */
  enqueue(entry: QueuedCompletion) {
    const queue = read();
    const index = queue.findIndex(
      (item) => item.habit_id === entry.habit_id && item.completed_date === entry.completed_date
    );

    if (index >= 0) {
      queue[index] = { ...entry, queued_at: queue[index].queued_at };
    } else {
      queue.push(entry);
    }

    write(queue);
  },
  remove(habitId: string, completedDate: string) {
    write(read().filter((item) => !(item.habit_id === habitId && item.completed_date === completedDate)));
  },
  clear() {
    write([]);
  },
  has(habitId: string, completedDate: string) {
    return read().some((item) => item.habit_id === habitId && item.completed_date === completedDate);
  },
};

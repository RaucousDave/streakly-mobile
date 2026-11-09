export type HabitType = 'BOOLEAN' | 'QUANTITATIVE';

export type Habit = {
  id: string;
  user_id?: string;
  title: string;
  type: HabitType;
  target_qty: number | null;
  mvtqty?: number | null;
  mvt_qty?: number | null;
  unit: string | null;
  is_archived?: boolean;
  created_at?: string;
  archived_at?: string | null;
  archived_at?: string | null;
};

export type HabitDashboardItem = {
  id: string;
  title: string;
  type: HabitType;
  target_qty: number | null;
  mvt_qty: number | null;
  unit: string | null;
  current_streak: number;
  is_completed_today: boolean;
  qty_achieved_today: number;
  is_mvt_met_today: boolean;
  is_target_met_today: boolean;
};

export type HeatmapEntry = {
  date: string;
  completed: boolean;
  total: number;
  completed_count: number;
};

export type DashboardUser = {
  display_name: string;
  timezone: string;
  freeze_balance: number;
};

export type DashboardResponse = {
  user: DashboardUser;
  today: {
    date: string;
    habits: HabitDashboardItem[];
  };
  heatmap_entry: HeatmapEntry[];
};

export type CreateHabitInput = {
  title: string;
  type: HabitType;
  target_qty?: number | null;
  mvt_qty?: number | null;
  unit?: string | null;
};

export type HabitCompletionInput = {
  habit_id: string;
  completed_date: string;
  completed_at_utc: string;
  qty_achieved: number;
  idempotency_key: string;
};

export type FreezeResult = {
  success?: boolean;
  freeze_balance?: number;
  target_date?: string;
  reason?: string;
};

export type AppConfig = {
  status: 'ok' | 'degraded' | string;
  server_time: string;
  min_supported_version: string;
  latest_version: string;
  force_update: boolean;
  update_available: boolean;
  update_url: string;
  maintenance: boolean;
  maintenance_message?: string;
};

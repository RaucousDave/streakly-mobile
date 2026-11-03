import { http, unwrap } from "@/api/client";
import type { DashboardResponse } from "@/types/habit";

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await http.get("/dashboard");
  const data = unwrap<DashboardResponse>(response.data);

  return {
    user: data.user,
    today: data.today,
    heatmap_entry: data.heatmap_entry ?? [],
  };
}

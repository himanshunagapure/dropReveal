import { supabase } from "@/lib/supabase";
import type { DashboardReel } from "@/types/dashboard";

export const DASHBOARD_REELS_QUERY_KEY = "dashboard-reels" as const;

export async function fetchDashboardReels(creatorId: string): Promise<DashboardReel[]> {
  const { data, error } = await supabase
    .from("reels")
    .select("*, products(*), files(*)")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as DashboardReel[];
  for (const reel of rows) {
    if (reel.products?.length) {
      reel.products.sort(
        (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
      );
    }
  }
  return rows;
}

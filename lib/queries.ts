import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { GoldRate } from "@/lib/types";

export async function getCurrentGoldRates(emirate = "UAE"): Promise<GoldRate[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await createPublicClient()
    .from("current_gold_rates")
    .select("emirate, karat, rate_per_gram_aed, effective_at")
    .eq("emirate", emirate);
  if (error) throw new Error(`Could not load gold rates: ${error.message}`);
  return (data ?? []) as GoldRate[];
}

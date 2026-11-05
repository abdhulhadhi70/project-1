"use client";
// Counts what customers do, for the jeweller's "My results". No personal
// data: a random id per browser, and only for real (database) shops.
import { getSupabase, supabaseConfigured } from "./supabase";

type EventType = "shop_view" | "piece_view" | "whatsapp_click" | "call_click" | "directions_click";

function sessionId(): string {
  try {
    let id = localStorage.getItem("tibr:sid");
    if (!id) { id = crypto.randomUUID(); localStorage.setItem("tibr:sid", id); }
    return id;
  } catch {
    return "anonymous";
  }
}

export function track(type: EventType, shopId?: string, pieceId?: string) {
  if (!supabaseConfigured || !shopId) return;
  void getSupabase().rpc("log_event", { p_shop: shopId, p_type: type, p_piece: pieceId ?? null, p_session: sessionId() });
}

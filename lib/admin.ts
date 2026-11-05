"use client";
// Reads and writes only an admin may make. The database checks it too: a
// non-admin calling these gets nothing, or an error.
import type { Area, Purity } from "@/data/catalogue";
import { getSupabase } from "./supabase";
import type { ShopRow } from "./portal";

const sb = () => getSupabase();
function check<T>(r: { data: T; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

export const listShops = async () => check(await sb().from("shops").select("*").order("name")) as ShopRow[];
export const createShop = async (row: Partial<ShopRow>) => check(await sb().from("shops").insert(row).select().single()) as ShopRow;

export type Application = {
  id: string; shop_name: string; contact_name: string; email: string; phone: string; emirate: string; area: string | null;
  message: string | null; status: "pending" | "approved" | "rejected"; shop_id: string | null; created_at: string; reviewed_at: string | null;
};
export const listApplications = async () => check(await sb().from("shop_applications").select("*").order("created_at", { ascending: false })) as Application[];
export const reviewApplication = async (id: string, status: Application["status"], shopId: string | null = null) =>
  check(await sb().from("shop_applications").update({ status, shop_id: shopId, reviewed_at: new Date().toISOString() }).eq("id", id).select().single()) as Application;

export type RateRow = { id: number; purity: Purity; rate_per_gram_aed: number; effective_at: string; set_by: string | null };
export const rateHistory = async () => check(await sb().from("gold_rates").select("*").order("effective_at", { ascending: false }).limit(60)) as RateRow[];
export async function setRates(rates: Partial<Record<Purity, number>>, userId: string) {
  const now = new Date().toISOString();
  const rows = Object.entries(rates).filter(([, v]) => v && v > 0).map(([purity, v]) => ({ purity, rate_per_gram_aed: v, effective_at: now, set_by: userId }));
  if (!rows.length) throw new Error("Enter at least one rate.");
  check(await sb().from("gold_rates").insert(rows));
}

export type SettingsRow = {
  site_name: string; contact_email: string | null; contact_whatsapp: string | null; notice_text: string | null;
  show_notice: boolean; hero_image: string | null; sections: Record<string, boolean>; updated_at: string;
};
export const getSettings = async () => check(await sb().from("site_settings").select("*").single()) as SettingsRow;
export const saveSettings = async (patch: Partial<SettingsRow>) =>
  check(await sb().from("site_settings").update(patch).eq("id", true).select().single()) as SettingsRow;

export type AreaRow = Area & { sort_order: number };
export const listAreas = async () => check(await sb().from("areas").select("*").order("sort_order")) as AreaRow[];
export const saveArea = async (row: AreaRow, isNew: boolean) =>
  check(await (isNew ? sb().from("areas").insert(row) : sb().from("areas").update(row).eq("slug", row.slug)).select().single()) as AreaRow;
export async function deleteArea(slug: string) {
  const r = await sb().from("areas").delete().eq("slug", slug).select("slug");
  if (r.error) throw new Error(/foreign key|violates/.test(r.error.message) ? "A shop is in this area. Move the shop first." : r.error.message);
}

export type UserRow = { id: string; email: string | null; full_name: string | null; role: "admin" | "jeweller"; created_at: string };
export const listUsers = async () => check(await sb().from("profiles").select("*").order("created_at", { ascending: false })) as UserRow[];
export const setUserRole = async (id: string, role: UserRow["role"]) =>
  check(await sb().from("profiles").update({ role }).eq("id", id).select().single()) as UserRow;
export const allMemberships = async () =>
  check(await sb().from("shop_members").select("shop_id, user_id, role")) as { shop_id: string; user_id: string; role: "owner" | "staff" }[];

/** Per-shop activity for the monthly report, from `days` ago until now. */
export async function shopStats(days = 30) {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  const [ev, rq] = await Promise.all([
    sb().from("events").select("shop_id, type").gte("created_at", since).limit(50000),
    sb().from("visit_requests").select("shop_id, status").gte("created_at", since).limit(10000),
  ]);
  const events = check(ev) as { shop_id: string; type: string }[];
  const reqs = check(rq) as { shop_id: string; status: string }[];
  const by = new Map<string, Record<string, number>>();
  const bump = (shop: string, k: string) => {
    const r = by.get(shop) ?? {};
    r[k] = (r[k] ?? 0) + 1;
    by.set(shop, r);
  };
  for (const e of events) bump(e.shop_id, e.type);
  for (const r of reqs) bump(r.shop_id, `requests_${r.status}`);
  return by;
}

/** A spreadsheet-safe CSV file, downloaded in the browser. */
export function downloadCsv(filename: string, header: string[], rows: (string | number | null | undefined)[][]) {
  const cell = (v: string | number | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formulas
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

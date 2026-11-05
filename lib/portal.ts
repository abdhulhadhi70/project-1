"use client";
// Reads and writes for the jeweller and admin portals. Everything goes
// through the signed-in person's session, so the database's access rules
// decide what succeeds: the portal never relies on hiding a button.
import type { Category, MakingCharge, Occasion, Purity, Style, Wearer } from "@/data/catalogue";
import { slug as slugify } from "./catalogue-query";
import { preparePhoto } from "./photo";
import { getSupabase } from "./supabase";

export type PieceStatus = "available" | "reserved_in_store" | "sold" | "hidden";
export type PriceMode = "listed" | "indicative" | "on_request";

export type PieceRow = {
  id: string; shop_id: string; code: string; slug: string; name: string; category: Category;
  purity: Purity | null; fineness: string | null; weight_grams: number | null;
  making_charge_type: MakingCharge["type"] | null; making_charge_value: number | null;
  stones: string | null; stones_aed: number; occasions: Occasion[]; wearer: Wearer; style: Style | null;
  price_mode: PriceMode; price_aed: number | null; description: string | null; images: string[];
  status: PieceStatus; featured_order: number | null; listed_at: string; stock_confirmed_at: string; updated_at: string;
};

export type ShopRow = {
  id: string; slug: string; name: string; area: string; address: string | null; lat: number | null; lng: number | null;
  about: string | null; speciality: string | null; hours: string | null; languages: string[];
  phone: string | null; whatsapp: string | null; logo_url: string | null; cover_url: string | null;
  show_prices: boolean; plan: "pilot" | "basic" | "featured"; featured_order: number | null;
  is_approved: boolean; is_active: boolean; is_demo: boolean; created_at: string;
};

export type VisitRequestRow = {
  id: string; shop_id: string; piece_id: string | null; customer_name: string; customer_phone: string;
  preferred_date: string | null; note: string | null; status: "new" | "contacted" | "visited" | "no_show"; created_at: string;
};

const sb = () => getSupabase();

/** Throws the database's message, so callers show it rather than failing silently. */
function check<T>(r: { data: T; error: { message: string; code?: string } | null }): T {
  if (r.error) {
    // An update the rules filter out finds "no rows" rather than failing.
    if (r.error.code === "PGRST116") throw new Error("You don't have permission to change this, or it no longer exists.");
    throw new Error(r.error.message);
  }
  return r.data;
}

/** For deletes: the rules silently skip rows you may not delete, so count them. */
function deleted(r: { data: unknown[] | null; error: { message: string } | null }) {
  if (r.error) throw new Error(r.error.message);
  if (!r.data?.length) throw new Error("You don't have permission to remove this, or it's already gone.");
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------
export async function listPieces(shopId?: string): Promise<PieceRow[]> {
  let q = sb().from("pieces").select("*").order("listed_at", { ascending: false });
  if (shopId) q = q.eq("shop_id", shopId);
  return check(await q) as PieceRow[];
}

export async function getPiece(id: string): Promise<PieceRow | null> {
  return check(await sb().from("pieces").select("*").eq("id", id).maybeSingle()) as PieceRow | null;
}

export type PieceDraft = Omit<PieceRow, "id" | "code" | "slug" | "listed_at" | "stock_confirmed_at" | "updated_at" | "featured_order"> & {
  featured_order?: number | null;
};

/** Two to four capital letters from the shop's name: "Sidra Atelier" -> "SA". */
export function codePrefix(shopName: string): string {
  const letters = shopName.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).map((w) => w[0].toUpperCase()).join("");
  return (letters.length >= 2 ? letters : (shopName.replace(/[^A-Za-z]/g, "").toUpperCase() + "XX")).slice(0, 4);
}

export async function createPiece(draft: PieceDraft, shopName: string): Promise<PieceRow> {
  // A new reference each time; on the rare clash with an existing code, try again.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${codePrefix(shopName)}-${String(1000 + Math.floor(Math.random() * 9000))}`;
    const row = { ...draft, code, slug: `${slugify(draft.name)}-${code.toLowerCase()}` };
    const r = await sb().from("pieces").insert(row).select().single();
    if (!r.error) return r.data as PieceRow;
    if (!/duplicate key|unique/i.test(r.error.message)) throw new Error(r.error.message);
  }
  throw new Error("Couldn't create a reference for this piece. Please try again.");
}

export async function updatePiece(id: string, patch: Partial<PieceRow>): Promise<PieceRow> {
  return check(await sb().from("pieces").update(patch).eq("id", id).select().single()) as PieceRow;
}

export async function deletePiece(piece: PieceRow) {
  deleted(await sb().from("pieces").delete().eq("id", piece.id).select("id"));
  await removePhotos(piece.images);
}

export async function duplicatePiece(piece: PieceRow, shopName: string): Promise<PieceRow> {
  const rest: Partial<PieceRow> = { ...piece };
  for (const k of ["id", "code", "slug", "listed_at", "stock_confirmed_at", "updated_at"] as const) delete rest[k];
  return createPiece({ ...(rest as PieceDraft), name: `${piece.name} (copy)`, status: "hidden", featured_order: null }, shopName);
}

export async function confirmStock(shopId: string): Promise<number> {
  return check(await sb().rpc("confirm_stock", { p_shop: shopId })) as number;
}

// ---------------------------------------------------------------------------
// Photos: <shop id>/<photo id>, stored as .webp and -600.webp
// ---------------------------------------------------------------------------
export async function uploadPhoto(file: File, shopId: string, shopName: string): Promise<string> {
  const p = await preparePhoto(file, shopName);
  const name = `${shopId}/${crypto.randomUUID()}`;
  const bucket = sb().storage.from("pieces");
  const opts = { contentType: "image/webp", cacheControl: "31536000", upsert: false };
  const a = await bucket.upload(`${name}.webp`, p.full, opts);
  if (a.error) throw new Error(a.error.message.includes("row-level security") ? "You can only add photos to your own shop." : a.error.message);
  const b = await bucket.upload(`${name}-600.webp`, p.small, opts);
  if (b.error) throw new Error(b.error.message);
  return name;
}

export async function removePhotos(names: string[]) {
  const uploads = names.filter((n) => n.includes("/"));
  if (uploads.length) await sb().storage.from("pieces").remove(uploads.flatMap((n) => [`${n}.webp`, `${n}-600.webp`]));
}

// ---------------------------------------------------------------------------
// Shops, requests, results, team
// ---------------------------------------------------------------------------
export async function getShop(id: string): Promise<ShopRow> {
  return check(await sb().from("shops").select("*").eq("id", id).single()) as ShopRow;
}

export async function updateShop(id: string, patch: Partial<ShopRow>): Promise<ShopRow> {
  return check(await sb().from("shops").update(patch).eq("id", id).select().single()) as ShopRow;
}

export async function listRequests(shopId?: string): Promise<VisitRequestRow[]> {
  let q = sb().from("visit_requests").select("*").order("created_at", { ascending: false }).limit(500);
  if (shopId) q = q.eq("shop_id", shopId);
  return check(await q) as VisitRequestRow[];
}

export async function setRequestStatus(id: string, status: VisitRequestRow["status"]) {
  check(await sb().from("visit_requests").update({ status }).eq("id", id).select("id").single());
}

export type Results = {
  days: number;
  counts: Record<"piece_view" | "shop_view" | "whatsapp_click" | "call_click" | "directions_click" | "visit_request", number>;
  byPiece: Map<string, number>;
};

/** Customer activity for the last `days` days. */
export async function results(shopId: string | undefined, days = 30): Promise<Results> {
  const since = new Date(Date.now() - days * 86400_000).toISOString();
  let q = sb().from("events").select("type, piece_id, shop_id").gte("created_at", since).limit(20000);
  if (shopId) q = q.eq("shop_id", shopId);
  const rows = check(await q) as { type: keyof Results["counts"]; piece_id: string | null }[];
  const counts = { piece_view: 0, shop_view: 0, whatsapp_click: 0, call_click: 0, directions_click: 0, visit_request: 0 };
  const byPiece = new Map<string, number>();
  for (const r of rows) {
    counts[r.type]++;
    if (r.piece_id && r.type !== "piece_view") byPiece.set(r.piece_id, (byPiece.get(r.piece_id) ?? 0) + 1);
  }
  return { days, counts, byPiece };
}

export type TeamMember = { user_id: string; email: string; full_name: string | null; role: "owner" | "staff"; joined_at: string };
export type Invite = { id: string; email: string; role: "owner" | "staff"; created_at: string; accepted_at: string | null };

export async function team(shopId: string): Promise<{ members: TeamMember[]; invites: Invite[] }> {
  const [m, i] = await Promise.all([
    sb().rpc("shop_team", { p_shop: shopId }),
    sb().from("shop_invites").select("id, email, role, created_at, accepted_at").eq("shop_id", shopId).is("accepted_at", null),
  ]);
  return { members: (check(m) ?? []) as TeamMember[], invites: (i.data ?? []) as Invite[] };
}

export async function addMember(shopId: string, email: string, role: "owner" | "staff" = "staff"): Promise<"added" | "invited"> {
  return check(await sb().rpc("add_member_by_email", { p_shop: shopId, p_email: email, p_role: role })) as "added" | "invited";
}

export async function removeMember(shopId: string, userId: string) {
  deleted(await sb().from("shop_members").delete().eq("shop_id", shopId).eq("user_id", userId).select("user_id"));
}

export async function cancelInvite(id: string) {
  deleted(await sb().from("shop_invites").delete().eq("id", id).select("id"));
}

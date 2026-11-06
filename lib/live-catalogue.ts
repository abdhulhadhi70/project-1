"use client";
// Reads the public catalogue from Supabase and maps it onto the same shapes
// as the demo in data/catalogue.ts. Importing this file registers it with
// the catalogue store; LiveCatalogue in the layout does that.
import type { Area, Category, MakingCharge, Occasion, Piece, Price, Purity, Shop, Style, Wearer } from "@/data/catalogue";
import { registerLoader, type CatalogueData, type Rates } from "./catalogue-store";
import { getSupabase, supabaseConfigured } from "./supabase";

type ShopRow = {
  id: string; slug: string; name: string; area: string; address: string | null; lat: number | null; lng: number | null;
  about: string | null; speciality: string | null; hours: string | null; languages: string[]; phone: string | null;
  whatsapp: string | null; is_demo: boolean; featured_order: number | null;
};
type PieceRow = {
  id: string; shop_id: string; code: string; slug: string; name: string; category: Category; purity: Purity | null;
  fineness: string | null; weight_grams: number | null; making_charge_type: MakingCharge["type"] | null;
  making_charge_value: number | null; stones: string | null; occasions: Occasion[]; wearer: Wearer; style: Style | null;
  description: string | null; images: string[]; listed_at: string; stock_confirmed_at: string; featured_order: number | null;
};
type PriceRow = { piece_id: string; price_aed: number | null; price_mode: Price["kind"]; rate_as_of: string | null };

const PUBLIC_STATUSES = ["available", "reserved_in_store"];

export async function fetchLiveCatalogue(): Promise<CatalogueData | null> {
  if (!supabaseConfigured) return null;
  const sb = getSupabase();
  // Filters are explicit, not left to the access rules: a signed-in jeweller
  // can read their own hidden pieces, and must not see them on public pages.
  const fresh = new Date(Date.now() - 30 * 86400_000).toISOString();
  const [areasR, shopsR, piecesR, pricesR, ratesR, settingsR] = await Promise.all([
    sb.from("areas").select("*").order("sort_order"),
    sb.from("shops").select("id, slug, name, area, address, lat, lng, about, speciality, hours, languages, phone, whatsapp, is_demo, featured_order")
      .eq("is_approved", true).eq("is_active", true).order("featured_order", { nullsFirst: false }),
    sb.from("pieces").select("*").in("status", PUBLIC_STATUSES).gt("stock_confirmed_at", fresh).order("listed_at", { ascending: false }),
    sb.from("piece_prices").select("piece_id, price_aed, price_mode, rate_as_of"),
    sb.from("current_gold_rates").select("purity, rate_per_gram_aed, effective_at"),
    sb.from("site_settings").select("*").maybeSingle(),
  ]);
  const failed = [areasR, shopsR, piecesR, pricesR, ratesR].find((r) => r.error);
  if (failed) throw failed.error;

  const areas = (areasR.data ?? []).map((a): Area => ({ slug: a.slug, name: a.name, emirate: a.emirate, note: a.note ?? "", lat: a.lat, lng: a.lng }));
  const areaBySlug = new Map(areas.map((a) => [a.slug, a]));
  const shopRows = (shopsR.data ?? []) as ShopRow[];
  const shopById = new Map(shopRows.map((s) => [s.id, s]));
  const prices = new Map(((pricesR.data ?? []) as PriceRow[]).map((p) => [p.piece_id, p]));

  const pieces = ((piecesR.data ?? []) as PieceRow[])
    .filter((p) => shopById.has(p.shop_id))
    .map((p): Piece => {
      const shop = shopById.get(p.shop_id)!;
      const pr = prices.get(p.id);
      const price: Price = !pr || pr.price_mode === "on_request" || pr.price_aed === null
        ? { kind: "on_request" }
        : pr.price_mode === "listed"
          ? { kind: "listed", aed: Number(pr.price_aed) }
          : { kind: "indicative", aed: Number(pr.price_aed), asOf: (pr.rate_as_of ?? p.listed_at).slice(0, 10) };
      const making: MakingCharge | undefined = p.making_charge_type && p.making_charge_value !== null
        ? p.making_charge_type === "percent"
          ? { type: "percent", value: Number(p.making_charge_value) }
          : { type: p.making_charge_type, aed: Number(p.making_charge_value) }
        : undefined;
      return {
        id: p.id, slug: p.slug, code: p.code, name: p.name, category: p.category,
        purity: p.purity ?? undefined, fineness: p.fineness ?? undefined,
        weightGrams: p.weight_grams === null ? undefined : Number(p.weight_grams),
        makingCharge: making, stones: p.stones ?? undefined, occasions: p.occasions ?? [], wearer: p.wearer,
        style: p.style ?? undefined, price, shop: shop.slug, description: p.description ?? "",
        images: p.images, listedAt: p.listed_at, stockConfirmedAt: p.stock_confirmed_at, demo: shop.is_demo,
      };
    });

  const shops = shopRows.map((s): Shop => {
    const area = areaBySlug.get(s.area);
    const theirs = pieces.filter((p) => p.shop === s.slug);
    return {
      id: s.id, slug: s.slug, name: s.name, area: s.area, address: s.address ?? "",
      lat: s.lat ?? area?.lat ?? 25.2, lng: s.lng ?? area?.lng ?? 55.3,
      about: s.about ?? "", hours: s.hours ?? undefined, languages: s.languages ?? [], speciality: s.speciality ?? "",
      cover: theirs[0]?.slug ?? "", whatsapp: s.whatsapp ?? undefined, phone: s.phone ?? undefined, demo: s.is_demo,
      featured: s.featured_order ?? undefined,
    };
  });

  const rateRows = ratesR.data ?? [];
  const perGram = Object.fromEntries(rateRows.map((r) => [r.purity, Number(r.rate_per_gram_aed)])) as Record<Purity, number>;
  const asOf = rateRows.map((r) => r.effective_at as string).sort().at(-1) ?? new Date().toISOString();
  const rates: Rates = { perGram, asOf, source: "set" };

  const st = settingsR.data;
  return {
    areas, shops, pieces, rates, source: "live",
    settings: st ? {
      siteName: st.site_name, contactEmail: st.contact_email, contactWhatsapp: st.contact_whatsapp,
      noticeText: st.notice_text, showNotice: st.show_notice, sections: st.sections ?? {},
    } : null,
  };
}

registerLoader(fetchLiveCatalogue);

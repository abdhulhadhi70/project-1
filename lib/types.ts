// Row types mirroring supabase/migrations. Keep in step with the SQL.

export const KARATS = [24, 22, 21, 18] as const;
export type Karat = (typeof KARATS)[number];

export const CATEGORIES = [
  "necklace", "bangle", "ring", "earrings", "chain", "pendant",
  "bracelet", "anklet", "set", "kids", "other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
] as const;
export type Emirate = (typeof EMIRATES)[number];

export type ShopPlan = "pilot" | "basic" | "featured";
export type ProductStatus = "available" | "reserved_in_store" | "sold" | "hidden";
export type EventType =
  | "shop_view" | "product_view" | "whatsapp_click" | "call_click" | "directions_click" | "visit_intent";
export type IntentStatus = "new" | "contacted" | "visited" | "no_show";

export type OpeningHours = Partial<Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", [string, string][]>>;

export type Shop = {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string | null;
  emirate: Emirate;
  area: string;
  address: string | null;
  google_maps_url: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  whatsapp_number: string | null;
  opening_hours: OpeningHours;
  logo_url: string | null;
  cover_url: string | null;
  about: string | null;
  show_prices: boolean;
  plan: ShopPlan;
  featured_order: number | null;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  shop_id: string;
  code: string;
  title: string;
  slug: string;
  category: Category;
  karat: Karat;
  weight_grams: number;
  making_charge_type: "per_gram" | "percent" | "fixed";
  making_charge_value: number;
  stone_details: string | null;
  occasion_tags: string[];
  images: string[];
  status: ProductStatus;
  last_confirmed_at: string;
  created_at: string;
  updated_at: string;
};

export type GoldRate = {
  emirate: string;
  karat: Karat;
  rate_per_gram_aed: number;
  effective_at: string;
};

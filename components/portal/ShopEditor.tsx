"use client";
// A shop's public profile. Jewellers edit what customers see; admins also
// see approval, plan, featuring and the demo flag.
import { useState } from "react";
import { useCatalogue } from "@/lib/catalogue-store";
import { slug as slugify } from "@/lib/catalogue-query";
import type { ShopRow } from "@/lib/portal";
import { Button, Field, Notice, Toggle, input } from "./ui";

export type ShopDraft = Omit<ShopRow, "id" | "created_at">;

export const blankShop = (): ShopDraft => ({
  slug: "", name: "", area: "", address: null, lat: null, lng: null, about: null, speciality: null, hours: null,
  languages: [], phone: null, whatsapp: null, logo_url: null, cover_url: null, show_prices: true,
  plan: "pilot", featured_order: null, is_approved: false, is_active: true, is_demo: false,
});

const ADMIN_ONLY = ["slug", "plan", "featured_order", "is_approved", "is_active", "is_demo"] as const;

export function ShopEditor({ initial, admin = false, onSave, saveLabel = "Save changes" }: {
  initial: ShopDraft; admin?: boolean; onSave: (patch: Partial<ShopRow>) => Promise<void>; saveLabel?: string;
}) {
  const { areas } = useCatalogue();
  const [d, setD] = useState<ShopDraft>(initial);
  const [languages, setLanguages] = useState(initial.languages.join(", "));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (p: Partial<ShopDraft>) => setD((x) => ({ ...x, ...p }));
  const area = areas.find((a) => a.slug === d.area);

  async function save() {
    setError("");
    if (!d.name.trim()) return setError("The shop needs a name.");
    if (!d.area) return setError("Choose the shop's area.");
    const whatsapp = d.whatsapp?.replace(/\D/g, "") || null;
    if (whatsapp && !/^[0-9]{8,15}$/.test(whatsapp)) return setError("WhatsApp: the full international number, digits only, e.g. 971501234567.");
    const phone = d.phone?.trim() || null;
    if (phone && !/^\+?[0-9 ]{7,20}$/.test(phone)) return setError("Phone: digits and spaces only, e.g. +971 4 123 4567.");
    const patch: Partial<ShopRow> = {
      ...d, name: d.name.trim(), whatsapp, phone,
      languages: languages.split(",").map((l) => l.trim()).filter(Boolean),
      slug: d.slug || slugify(d.name),
    };
    if (!admin) for (const k of ADMIN_ONLY) delete patch[k];
    setBusy(true);
    try {
      await onSave(patch);
    } catch (e) {
      const m = (e as Error).message;
      setError(/shops_slug_key|duplicate/.test(m) ? "Another shop already uses that web address (slug). Choose a different one." : m);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Shop name" className="sm:col-span-2"><input className={input} value={d.name} maxLength={120} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Area">
          <select className={input} value={d.area} onChange={(e) => set({ area: e.target.value })}>
            <option value="">Choose…</option>
            {areas.map((a) => <option key={a.slug} value={a.slug}>{a.name}, {a.emirate}</option>)}
          </select>
        </Field>
        <Field label="Speciality" hint="A few words, e.g. “Bridal sets and coin necklaces”.">
          <input className={input} value={d.speciality ?? ""} maxLength={80} onChange={(e) => set({ speciality: e.target.value || null })} />
        </Field>
        <Field label="Address" className="sm:col-span-2"><input className={input} value={d.address ?? ""} maxLength={200} onChange={(e) => set({ address: e.target.value || null })} placeholder="Shop 14, Sikkat Al Khail Road, Deira" /></Field>
        <Field label="WhatsApp number" hint="International format, e.g. 971501234567.">
          <input className={input} inputMode="tel" value={d.whatsapp ?? ""} onChange={(e) => set({ whatsapp: e.target.value || null })} />
        </Field>
        <Field label="Phone">
          <input className={input} inputMode="tel" value={d.phone ?? ""} onChange={(e) => set({ phone: e.target.value || null })} placeholder="+971 4 123 4567" />
        </Field>
        <Field label="Opening hours" className="sm:col-span-2">
          <input className={input} value={d.hours ?? ""} maxLength={120} onChange={(e) => set({ hours: e.target.value || null })} placeholder="Sat–Thu 10:00–22:00 · Fri 16:00–22:00" />
        </Field>
        <Field label="Languages spoken" hint="Separated by commas." className="sm:col-span-2">
          <input className={input} value={languages} onChange={(e) => setLanguages(e.target.value)} placeholder="Arabic, English, Malayalam" />
        </Field>
        <Field label="About the shop" className="sm:col-span-2">
          <textarea className={`${input} h-auto py-2.5`} rows={4} maxLength={1000} value={d.about ?? ""} onChange={(e) => set({ about: e.target.value || null })} />
        </Field>
        <div className="sm:col-span-2">
          <p className="text-[13px] text-stone">Map pin</p>
          <div className="mt-1.5 grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className={input} inputMode="decimal" aria-label="Latitude" placeholder="Latitude" value={d.lat ?? ""} onChange={(e) => set({ lat: e.target.value ? Number(e.target.value) : null })} />
            <input className={input} inputMode="decimal" aria-label="Longitude" placeholder="Longitude" value={d.lng ?? ""} onChange={(e) => set({ lng: e.target.value ? Number(e.target.value) : null })} />
            <Button variant="secondary" className="mt-1.5 h-12" disabled={!area} onClick={() => area && set({ lat: area.lat, lng: area.lng })}>Use area</Button>
          </div>
          <p className="mt-1 text-[12px] text-stone">In Google Maps, press and hold on your shop: the two numbers it shows go here.</p>
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
        <div className="rounded-2xl border border-line bg-card p-4">
          <Toggle checked={d.show_prices} onChange={(show_prices) => set({ show_prices })} label="Show prices"
            hint="Off: every piece shows “Price on request”, with weight and purity." />
        </div>
        {admin && (
          <div className="space-y-3 rounded-2xl border border-line bg-card p-4">
            <p className="text-[13px] font-medium">Admin</p>
            <Field label="Web address (slug)" hint="Used in the shop's link.">
              <input className={input} value={d.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} placeholder={slugify(d.name) || "shop-name"} />
            </Field>
            <Field label="Plan">
              <select className={input} value={d.plan} onChange={(e) => set({ plan: e.target.value as ShopDraft["plan"] })}>
                <option value="pilot">Pilot</option><option value="basic">Basic</option><option value="featured">Featured</option>
              </select>
            </Field>
            <Field label="Featured order" hint="Blank for not featured; 1 shows first.">
              <input className={input} inputMode="numeric" value={d.featured_order ?? ""} onChange={(e) => set({ featured_order: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })} />
            </Field>
            <Toggle checked={d.is_approved} onChange={(is_approved) => set({ is_approved })} label="Approved" hint="Only approved shops appear on the site." />
            <Toggle checked={d.is_active} onChange={(is_active) => set({ is_active })} label="Active" hint="Off hides the shop and its pieces at once." />
            <Toggle checked={d.is_demo} onChange={(is_demo) => set({ is_demo })} label="Demonstration shop" hint="Labelled as demo; contact buttons send nothing." />
          </div>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" disabled={busy} className="h-12 w-full">{busy ? "Saving…" : saveLabel}</Button>
      </aside>
    </form>
  );
}

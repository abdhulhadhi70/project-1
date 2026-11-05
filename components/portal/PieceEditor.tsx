"use client";
// Add or edit a piece. Built for a phone first: photos at the top (camera
// or gallery), then only the fields a customer needs to compare shops.
import { useRef, useState } from "react";
import { CATEGORIES, OCCASIONS, STYLES, WEARERS, type Category, type Purity } from "@/data/catalogue";
import { useCatalogue } from "@/lib/catalogue-store";
import { aed } from "@/lib/format";
import { createPiece, removePhotos, updatePiece, uploadPhoto, type PieceDraft, type PieceRow } from "@/lib/portal";
import { estimatePrice, vatRateFor } from "@/lib/pricing";
import { PieceImage } from "../PieceImage";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "../Icons";
import { Button, Chips, Field, Notice, STATUS_OPTIONS, input } from "./ui";

const PURITIES: Purity[] = ["24K", "22K", "21K", "18K"];
const MAX_PHOTOS = 6;

const blank = (shopId: string): PieceDraft => ({
  shop_id: shopId, name: "", category: "chains", purity: "22K", fineness: null, weight_grams: null,
  making_charge_type: "per_gram", making_charge_value: null, stones: null, stones_aed: 0, occasions: [],
  wearer: "women", style: null, price_mode: "indicative", price_aed: null, description: null, images: [], status: "available",
});

const num = (v: string) => (v.trim() === "" ? null : Number(v));

export function PieceEditor({ shopId, shopName, existing, onSaved, admin = false }: {
  shopId: string; shopName: string; existing?: PieceRow; onSaved: (row: PieceRow) => void; admin?: boolean;
}) {
  const { rates } = useCatalogue();
  const [d, setD] = useState<PieceDraft>(() => (existing ? { ...existing } : blank(shopId)));
  const [removed, setRemoved] = useState<string[]>([]);
  const [uploading, setUploading] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const set = (patch: Partial<PieceDraft>) => setD((x) => ({ ...x, ...patch }));

  const bullion = d.category === "coins" || d.category === "bars";
  const canPrice = !!d.purity && !!d.weight_grams && d.making_charge_type !== null && d.making_charge_value !== null;
  const estimate = canPrice && rates.perGram[d.purity!]
    ? estimatePrice({
        ratePerGramAed: rates.perGram[d.purity!], weightGrams: d.weight_grams!, makingChargeType: d.making_charge_type!,
        makingChargeValue: d.making_charge_value!, vatRate: vatRateFor(d.purity!, d.fineness ?? undefined),
      }).total + (d.stones_aed || 0) * 1.05
    : null;

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_PHOTOS - d.images.length;
    const pick = Array.from(files).slice(0, room);
    if (files.length > room) setError(`Up to ${MAX_PHOTOS} photos per piece: ${files.length - room} not added.`);
    else setError("");
    setUploading((n) => n + pick.length);
    for (const f of pick) {
      try {
        const name = await uploadPhoto(f, shopId, shopName);
        setD((x) => ({ ...x, images: [...x.images, name] }));
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (file.current) file.current.value = "";
  }

  const move = (i: number, by: number) => setD((x) => {
    const images = [...x.images];
    const [m] = images.splice(i, 1);
    images.splice(i + by, 0, m);
    return { ...x, images };
  });
  const drop = (i: number) => {
    const name = d.images[i];
    setD((x) => ({ ...x, images: x.images.filter((_, k) => k !== i) }));
    // Removed from storage only once the piece is saved without it.
    if (existing?.images.includes(name)) setRemoved((r) => [...r, name]);
    else void removePhotos([name]);
  };

  async function save() {
    setError("");
    if (!d.name.trim()) return setError("Give the piece a name, e.g. \"22K Rope Chain, 50 cm\".");
    if (!d.images.length) return setError("Add at least one photo.");
    if (d.price_mode !== "on_request" && !canPrice) return setError("To show a price, fill in purity, weight and making charge, or choose \"Price on request\".");
    if (d.price_mode === "listed" && !(d.price_aed && d.price_aed > 0)) return setError("Enter the price you want to show, or choose \"From today's rate\".");
    setBusy(true);
    try {
      const draft: PieceDraft = {
        ...d, name: d.name.trim(), fineness: d.purity === "24K" ? d.fineness : null,
        price_aed: d.price_mode === "listed" ? d.price_aed : null,
      };
      const row = existing ? await updatePiece(existing.id, stripReadOnly(draft, admin)) : await createPiece(stripReadOnly(draft, admin) as PieceDraft, shopName);
      if (removed.length) await removePhotos(removed);
      setRemoved([]);
      onSaved(row);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]" onSubmit={(e) => { e.preventDefault(); void save(); }}>
      <div className="space-y-6">
        <fieldset>
          <legend className="text-[15px] font-medium">Photos</legend>
          <p className="mt-0.5 text-[12px] text-stone">Up to {MAX_PHOTOS}. The first is the cover. We resize them, remove location data and add your shop name in the corner.</p>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {d.images.map((img, i) => (
              <li key={img} className="relative aspect-[4/5] bg-limestone">
                <PieceImage name={img} alt={`Photo ${i + 1}`} sizes="120px" className="size-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 bg-ink px-1.5 text-[11px] text-chalk">Cover</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/60">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" className="grid size-8 place-items-center text-chalk disabled:opacity-30"><ChevronLeftIcon /></button>
                  <button type="button" onClick={() => drop(i)} aria-label="Remove photo" className="grid size-8 place-items-center text-chalk"><CloseIcon className="size-4" /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === d.images.length - 1} aria-label="Move later" className="grid size-8 place-items-center text-chalk disabled:opacity-30"><ChevronRightIcon /></button>
                </div>
              </li>
            ))}
            {Array.from({ length: uploading }).map((_, i) => (
              <li key={`u${i}`} className="grid aspect-[4/5] animate-pulse place-items-center bg-limestone text-[12px] text-stone">Uploading…</li>
            ))}
            {d.images.length + uploading < MAX_PHOTOS && (
              <li>
                <label className="grid aspect-[4/5] cursor-pointer place-items-center border border-dashed border-line-strong text-center text-[13px] text-ink-soft hover:border-ink">
                  <span>+ Add<br />photos</span>
                  <input ref={file} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addPhotos(e.target.files)} />
                </label>
              </li>
            )}
          </ul>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" className="sm:col-span-2">
            <input className={input} value={d.name} maxLength={120} onChange={(e) => set({ name: e.target.value })} placeholder="22K Rope Chain, 50 cm" />
          </Field>
          <Field label="Category">
            <select className={input} value={d.category} onChange={(e) => set({ category: e.target.value as Category })}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.singular}</option>)}
            </select>
          </Field>
          <Field label="Purity">
            <select className={input} value={d.purity ?? ""} onChange={(e) => set({ purity: (e.target.value || null) as Purity | null })}>
              <option value="">Not gold / not stated</option>
              {PURITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          {d.purity === "24K" && bullion && (
            <Field label="Fineness" hint="999.9 or 999 bullion is VAT-free in the UAE.">
              <select className={input} value={d.fineness ?? ""} onChange={(e) => set({ fineness: e.target.value || null })}>
                <option value="">Not stated</option><option>999.9</option><option>999</option><option>995</option>
              </select>
            </Field>
          )}
          <Field label="Weight (grams)">
            <input className={input} inputMode="decimal" value={d.weight_grams ?? ""} onChange={(e) => set({ weight_grams: num(e.target.value.replace(/[^0-9.]/g, "")) })} placeholder="18.6" />
          </Field>
          <Field label="Making charge">
            <div className="grid grid-cols-[1fr_7rem] gap-2">
              <select className={input} value={d.making_charge_type ?? ""} onChange={(e) => set({ making_charge_type: (e.target.value || null) as PieceDraft["making_charge_type"] })}>
                <option value="per_gram">AED per gram</option><option value="percent">% of gold value</option><option value="fixed">Fixed AED</option>
              </select>
              <input className={input} inputMode="decimal" value={d.making_charge_value ?? ""} aria-label="Making charge amount"
                onChange={(e) => set({ making_charge_value: num(e.target.value.replace(/[^0-9.]/g, "")) })} placeholder="24" />
            </div>
          </Field>
          <Field label="Stones (optional)" hint="What and how many, as you'd describe them to a customer.">
            <input className={input} value={d.stones ?? ""} maxLength={200} onChange={(e) => set({ stones: e.target.value || null })} placeholder="Freshwater pearls, 6 mm" />
          </Field>
          {d.stones && (
            <Field label="Stones price, AED" hint="Added on top of gold and making.">
              <input className={input} inputMode="decimal" value={d.stones_aed || ""} onChange={(e) => set({ stones_aed: Number(e.target.value.replace(/[^0-9.]/g, "")) || 0 })} />
            </Field>
          )}
        </div>

        <fieldset>
          <legend className="text-[13px] text-stone">Occasions</legend>
          <Chips options={OCCASIONS} value={d.occasions} onChange={(occasions) => set({ occasions })} />
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="For">
            <select className={input} value={d.wearer} onChange={(e) => set({ wearer: e.target.value as PieceDraft["wearer"] })}>
              {WEARERS.map((w) => <option key={w.id} value={w.id}>{w.label}</option>)}
            </select>
          </Field>
          <Field label="Style (optional)">
            <select className={input} value={d.style ?? ""} onChange={(e) => set({ style: (e.target.value || null) as PieceDraft["style"] })}>
              <option value="">Not stated</option>
              {STYLES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description (optional)">
          <textarea className={`${input} h-auto py-2.5`} rows={3} maxLength={1000} value={d.description ?? ""} onChange={(e) => set({ description: e.target.value || null })}
            placeholder="Length, clasp, finish: what a customer would ask." />
        </Field>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
        <fieldset className="border border-line p-4">
          <legend className="px-1 text-[15px] font-medium">Price</legend>
          {([
            ["indicative", "From today's rate", "Moves with the gold rate our team sets each day."],
            ["listed", "A price I set", "Shown exactly as you enter it."],
            ["on_request", "Price on request", "Customers ask you; weight and purity still show."],
          ] as const).map(([id, label, hint]) => (
            <label key={id} className="flex cursor-pointer items-start gap-3 py-2">
              <input type="radio" name="price_mode" checked={d.price_mode === id} onChange={() => set({ price_mode: id })} className="mt-1 size-4 accent-[var(--color-ink)]" />
              <span><span className="block text-[14px]">{label}</span><span className="block text-[12px] text-stone">{hint}</span></span>
            </label>
          ))}
          {d.price_mode === "listed" && (
            <Field label="Your price, AED (including VAT)">
              <input className={input} inputMode="decimal" value={d.price_aed ?? ""} onChange={(e) => set({ price_aed: num(e.target.value.replace(/[^0-9.]/g, "")) })} />
            </Field>
          )}
          <p className="mt-3 border-t border-line pt-3 text-[13px] text-ink-soft">
            {estimate !== null ? <>From today&apos;s rate this works out at <strong className="text-ink">{aed(Math.round(estimate))}</strong>.</> : "Add purity, weight and making charge to see the price from today's rate."}
          </p>
        </fieldset>
        <Field label="Status">
          <select className={input} value={d.status} onChange={(e) => set({ status: e.target.value as PieceDraft["status"] })}>
            {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </Field>
        {admin && (
          <Field label="Featured on homepage (order)" hint="Blank for not featured; 1 shows first.">
            <input className={input} inputMode="numeric" value={d.featured_order ?? ""} onChange={(e) => set({ featured_order: num(e.target.value.replace(/[^0-9]/g, "")) })} />
          </Field>
        )}
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" disabled={busy || uploading > 0} className="h-12 w-full">
          {uploading ? "Waiting for photos…" : busy ? "Saving…" : existing ? "Save changes" : "Add piece"}
        </Button>
        <p className="text-[12px] text-stone">Changes show on the site as soon as you save.</p>
      </aside>
    </form>
  );
}

/**
 * What a save may write: never the id, reference, dates or (unless an admin)
 * the homepage featuring, which the database refuses from a jeweller.
 */
function stripReadOnly(d: PieceDraft, admin: boolean): Partial<PieceRow> {
  const { featured_order, ...rest } = d as PieceDraft & Partial<PieceRow>;
  for (const k of ["id", "code", "slug", "listed_at", "stock_confirmed_at", "updated_at"] as const) delete rest[k];
  return admin ? { ...rest, featured_order: featured_order ?? null } : rest;
}

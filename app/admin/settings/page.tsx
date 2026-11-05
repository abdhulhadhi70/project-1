"use client";
import { useEffect, useState } from "react";
import { Button, Card, Field, Flash, Notice, Toggle, input, useFlash } from "@/components/portal/ui";
import { getSettings, saveSettings, type SettingsRow } from "@/lib/admin";
import { loadLiveCatalogue } from "@/lib/catalogue-store";

const SECTIONS: [string, string][] = [
  ["rates", "Gold rate strip"], ["categories", "Browse by category"], ["newest", "Newest pieces"], ["bridal", "For the wedding"],
  ["bullion", "Coins and bars"], ["districts", "Gold districts"], ["jewellers", "Jewellers"], ["estimator", "Price estimator"], ["popular", "Popular searches"],
];

export default function Settings() {
  const [s, setS] = useState<SettingsRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useFlash();
  useEffect(() => { getSettings().then(setS).catch((e) => setError(e.message)); }, []);
  if (error && !s) return <Notice tone="error">{error}</Notice>;
  if (!s) return <p className="text-[14px] text-stone">Loading…</p>;
  const set = (p: Partial<SettingsRow>) => setS({ ...s, ...p });
  return (
    <form className="grid gap-5 lg:grid-cols-2" onSubmit={async (e) => {
      e.preventDefault();
      setError("");
      const wa = s.contact_whatsapp?.replace(/\D/g, "") || null;
      if (wa && !/^[0-9]{8,15}$/.test(wa)) return setError("WhatsApp: the full international number, digits only.");
      setBusy(true);
      try {
        setS(await saveSettings({ site_name: s.site_name.trim() || "Tibr", contact_email: s.contact_email?.trim() || null, contact_whatsapp: wa,
          notice_text: s.notice_text?.trim() || null, show_notice: s.show_notice, sections: s.sections }));
        setFlash("Saved. The site updates for visitors as they next load a page.");
        void loadLiveCatalogue(true);
      } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
    }}>
      <Card title="The site">
        <div className="space-y-4">
          <Field label="Site name"><input className={input} maxLength={40} value={s.site_name} onChange={(e) => set({ site_name: e.target.value })} /></Field>
          <Field label="Contact email" hint="Shown on the Contact page."><input className={input} type="email" value={s.contact_email ?? ""} onChange={(e) => set({ contact_email: e.target.value })} /></Field>
          <Field label="Contact WhatsApp" hint="International format, digits only."><input className={input} inputMode="tel" value={s.contact_whatsapp ?? ""} onChange={(e) => set({ contact_whatsapp: e.target.value })} /></Field>
        </div>
      </Card>
      <Card title="Notice line at the top">
        <Toggle checked={s.show_notice} onChange={(show_notice) => set({ show_notice })} label="Show the notice line" />
        <Field label="Text" hint="Leave blank to show the standard demo notice while any demo shop is listed.">
          <input className={input} maxLength={200} value={s.notice_text ?? ""} onChange={(e) => set({ notice_text: e.target.value })} placeholder="Opening offer for jewellers: list free for the first month." />
        </Field>
      </Card>
      <Card title="Homepage sections" className="lg:col-span-2">
        <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map(([k, label]) => (
            <Toggle key={k} checked={s.sections?.[k] !== false} onChange={(v) => set({ sections: { ...s.sections, [k]: v } })} label={label} />
          ))}
        </div>
        <p className="mt-2 text-[12px] text-stone">Sections with nothing to show stay hidden whatever is set here.</p>
      </Card>
      <div className="space-y-3 lg:col-span-2">
        {error && <Notice tone="error">{error}</Notice>}
        <Button type="submit" disabled={busy} className="h-12">{busy ? "Saving…" : "Save settings"}</Button>
      </div>
      <Flash message={flash} />
    </form>
  );
}

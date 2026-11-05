"use client";
// The day's gold rates: one screen, four boxes, save. Indicative prices on
// the whole site follow the moment this is saved.
import { useEffect, useState } from "react";
import { Button, Card, Field, Flash, Notice, input, useFlash } from "@/components/portal/ui";
import type { Purity } from "@/data/catalogue";
import { rateHistory, setRates, type RateRow } from "@/lib/admin";
import { loadLiveCatalogue } from "@/lib/catalogue-store";
import { aed } from "@/lib/format";
import { getSupabase } from "@/lib/supabase";

const ORDER: Purity[] = ["24K", "22K", "21K", "18K"];
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai" });

export default function Rates() {
  const [history, setHistory] = useState<RateRow[]>([]);
  const [values, setValues] = useState<Record<Purity, string>>({ "24K": "", "22K": "", "21K": "", "18K": "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useFlash();
  const load = () => rateHistory().then((h) => {
    setHistory(h);
    setValues((v) => Object.fromEntries(ORDER.map((k) => [k, v[k] || String(h.find((r) => r.purity === k)?.rate_per_gram_aed ?? "")])) as Record<Purity, string>);
  }).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);

  const latest = (k: Purity) => history.find((r) => r.purity === k);
  // A big jump is usually a typo (a missing digit, or the price per tola).
  const odd = ORDER.filter((k) => {
    const v = Number(values[k]), l = latest(k)?.rate_per_gram_aed;
    return v && l && Math.abs(v - l) / l > 0.08;
  });

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
      <Card title="Today's rates, AED per gram">
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          if (odd.length && !confirm(`${odd.join(", ")} changed by more than 8% since the last rate. Save anyway?`)) return;
          setBusy(true);
          try {
            const { data } = await getSupabase().auth.getUser();
            await setRates(Object.fromEntries(ORDER.map((k) => [k, Number(values[k]) || 0])), data.user!.id);
            setFlash("Saved. Prices across the site now use these rates.");
            void load();
            void loadLiveCatalogue(true);
          } catch (err) { setError((err as Error).message); } finally { setBusy(false); }
        }}>
          <div className="grid grid-cols-2 gap-3">
            {ORDER.map((k) => (
              <Field key={k} label={k} hint={latest(k) ? `Last: ${aed(latest(k)!.rate_per_gram_aed)} · ${when(latest(k)!.effective_at)}` : undefined}>
                <input className={input} inputMode="decimal" value={values[k]} onChange={(e) => setValues({ ...values, [k]: e.target.value.replace(/[^0-9.]/g, "") })} />
              </Field>
            ))}
          </div>
          {odd.length > 0 && <Notice tone="warn">{odd.join(", ")} differ by more than 8% from the last rate. Check for a typo.</Notice>}
          {error && <Notice tone="error">{error}</Notice>}
          <Button type="submit" disabled={busy} className="h-12 w-full">{busy ? "Saving…" : "Save today's rates"}</Button>
          <p className="text-[12px] text-stone">Per gram, not per tola (1 tola = 11.664 g). Each save keeps a record below.</p>
        </form>
      </Card>
      <Card title="History">
        <ul className="divide-y divide-line border-y border-line text-[14px]">
          {history.map((r) => (
            <li key={r.id} className="flex justify-between py-2"><span>{r.purity} · {when(r.effective_at)}</span><span className="tabular-nums">{aed(r.rate_per_gram_aed)}</span></li>
          ))}
        </ul>
      </Card>
      <Flash message={flash} />
    </div>
  );
}

import { formatAed } from "@/lib/pricing";
import { t, type Messages } from "@/lib/i18n";
import { KARATS, type GoldRate } from "@/lib/types";

const timeFormat = new Intl.DateTimeFormat("en-AE", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Dubai",
});

export function GoldRatesBanner({ rates, messages: m }: { rates: GoldRate[]; messages: Messages }) {
  const byKarat = new Map(rates.map((r) => [r.karat, r]));
  const latest = rates.reduce<string | null>(
    (acc, r) => (acc === null || r.effective_at > acc ? r.effective_at : acc),
    null,
  );

  return (
    <section aria-labelledby="rates-title" className="bg-charcoal-soft text-ivory">
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="rates-title" className="font-display text-2xl text-gold-light">{m.rates.title}</h2>
          {latest && (
            <p className="text-xs text-ivory/70">
              {t(m.rates.asOf, { time: timeFormat.format(new Date(latest)) })} · {m.rates.perGram}
            </p>
          )}
        </div>
        {rates.length === 0 ? (
          <p className="mt-3 text-sm text-ivory/80">{m.rates.none}</p>
        ) : (
          <dl className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-px bg-ivory/10 rounded overflow-hidden">
            {KARATS.map((k) => {
              const r = byKarat.get(k);
              return (
                <div key={k} className="bg-charcoal-soft px-3 py-3">
                  <dt className="text-xs uppercase tracking-wider text-ivory/70">{t(m.rates.karat, { karat: k })}</dt>
                  <dd className="mt-1 text-lg font-medium">{r ? formatAed(r.rate_per_gram_aed) : "—"}</dd>
                </div>
              );
            })}
          </dl>
        )}
        <p className="mt-3 text-xs text-ivory/60">{m.rates.source}</p>
      </div>
    </section>
  );
}

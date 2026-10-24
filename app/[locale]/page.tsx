import { GoldRatesBanner } from "@/components/GoldRatesBanner";
import { getMessages, isLocale } from "@/lib/i18n";
import { getCurrentGoldRates } from "@/lib/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { notFound } from "next/navigation";

// Rates change daily; re-render at most every 5 minutes.
export const revalidate = 300;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);
  const rates = await getCurrentGoldRates();

  return (
    <>
      <GoldRatesBanner rates={rates} messages={m} />
      <section className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight max-w-2xl">
          {m.site.tagline}
        </h1>
        <p className="mt-4 max-w-prose text-ink-soft">{m.site.description}</p>
        <div className="mt-6 h-px w-24 bg-gold" aria-hidden />
        {!isSupabaseConfigured && (
          <div role="status" className="mt-8 max-w-prose rounded border border-line bg-ivory-dim p-4 text-sm">
            <p className="font-medium">{m.home.setupTitle}</p>
            <p className="mt-1 text-ink-soft">{m.home.setupBody}</p>
          </div>
        )}
      </section>
    </>
  );
}

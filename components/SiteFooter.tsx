import type { Messages } from "@/lib/i18n";

export function SiteFooter({ messages: m }: { messages: Messages }) {
  return (
    <footer className="bg-charcoal text-ivory/80 text-sm">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-3">
        <p className="max-w-prose">{m.footer.disclaimer}</p>
        <p className="max-w-prose text-ivory/60">{m.footer.prices}</p>
      </div>
    </footer>
  );
}

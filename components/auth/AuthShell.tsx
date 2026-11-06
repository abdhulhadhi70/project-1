import Link from "next/link";

/** The frame every sign-in page shares: one narrow column. */
export function AuthShell({ title, intro, children, foot }: { title: string; intro?: React.ReactNode; children: React.ReactNode; foot?: React.ReactNode }) {
  return (
    <section className="page page-x py-10 md:py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-card p-5 md:p-8">
        <p className="text-[13px] text-stone">For jewellers and our team</p>
        <h1 className="mt-1 font-serif text-[36px] leading-none tracking-[-0.015em] md:text-[44px]">{title}</h1>
        {intro && <div className="mt-3 text-[15px] leading-relaxed text-ink-soft">{intro}</div>}
        <div className="mt-7">{children}</div>
        {foot && <div className="mt-6 border-t border-line pt-4 text-[14px] text-ink-soft">{foot}</div>}
        <p className="mt-8 text-[12px] text-stone">
          Customers don&apos;t need an account. <Link href="/" className="underline decoration-line-strong underline-offset-4">Back to the site</Link>
        </p>
      </div>
    </section>
  );
}

export const field = "mt-1.5 h-12 w-full rounded-xl border border-line-strong bg-card px-3.5 text-[16px] text-ink outline-none focus:border-ink";
export const button = "h-12 w-full rounded-full bg-terracotta text-[15px] font-medium text-white transition-colors hover:bg-terracotta-deep disabled:opacity-60";

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok"; children: React.ReactNode }) {
  const c = tone === "error" ? "border-[#9a3b2f] text-[#7d2f25]" : tone === "ok" ? "border-ink text-ink" : "border-line-strong text-ink-soft";
  return <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl border-l-2 bg-limestone/60 px-3.5 py-2.5 text-[14px] ${c}`}>{children}</p>;
}

export function NotConnected() {
  return <Notice>Sign-in isn&apos;t connected yet: the site&apos;s database keys are missing from this build.</Notice>;
}

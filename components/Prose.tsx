// A plain text page: one column, a readable measure.
export function Prose({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <article className="page page-x pt-8 md:pt-16">
      <div className="max-w-[40rem]">
        <h1 className="font-serif text-[40px] leading-none tracking-[-0.015em] md:text-[56px]">{title}</h1>
        {intro && <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">{intro}</p>}
        <div className="mt-8 space-y-5 border-t border-line pt-7 text-[15px] leading-relaxed text-ink-soft [&_h2]:pt-3 [&_h2]:text-[16px] [&_h2]:font-medium [&_h2]:text-ink [&_a]:text-ink [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-4">
          {children}
        </div>
      </div>
    </article>
  );
}

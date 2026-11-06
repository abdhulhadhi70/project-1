import { PageHeader } from "./PageHeader";

// A plain text page: a title band, then one column at a readable measure.
export function Prose({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <article>
      <PageHeader title={title} intro={intro} />
      <div className="page page-x pt-8 md:pt-12">
        <div className="max-w-[40rem] space-y-5 text-[16px] leading-relaxed text-ink-soft [&_h2]:pt-4 [&_h2]:font-serif [&_h2]:text-[26px] [&_h2]:leading-tight [&_h2]:text-ink [&_a]:text-ink [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-4">
          {children}
        </div>
      </div>
    </article>
  );
}

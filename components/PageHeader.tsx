// The cocoa band that opens every inner page, so each one starts the way
// the homepage does. Short on a phone: the content is what people came for.
export function PageHeader({ title, intro, kicker, children }: { title: React.ReactNode; intro?: React.ReactNode; kicker?: string; children?: React.ReactNode }) {
  return (
    <header className="cocoa-glow text-cream">
      <div className="page page-x pb-8 pt-7 md:pb-12 md:pt-12">
        {kicker && <p className="text-[13px] text-gold">{kicker}</p>}
        <h1 className={`font-serif text-[38px] leading-[1] tracking-[-0.02em] md:text-[56px] ${kicker ? "mt-2" : ""}`}>{title}</h1>
        {intro && <div className="mt-3 max-w-2xl text-[15px] leading-relaxed text-cream-soft md:text-[17px]">{intro}</div>}
        {children}
      </div>
    </header>
  );
}

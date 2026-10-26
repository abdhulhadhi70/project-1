import type { Price as PriceT } from "@/data/catalogue";
import { aed } from "@/lib/format";

/** Card-size price: the figure, and a quiet word when it is not a fixed price. */
export function Price({ price, className = "" }: { price: PriceT; className?: string }) {
  if (price.kind === "on_request") {
    return <p className={`text-ink-soft ${className}`}>Request price</p>;
  }
  return (
    <p className={className}>
      <span className="font-semibold text-ink">{aed(price.aed)}</span>
      {price.kind === "indicative" && <span className="ml-1.5 text-[12px] text-stone">indicative</span>}
    </p>
  );
}

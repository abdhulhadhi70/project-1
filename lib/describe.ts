// Page titles for a search, the way Property Finder writes
// "Apartments for rent in Dubai Marina".
import { CATEGORIES, areaBySlug } from "@/data/catalogue";
import { locationLabel, type Query } from "./catalogue-query";

const NOUN = { jewellery: "gold jewellery", bridal: "bridal gold", coins_bars: "gold coins and bars" } as const;

export function describeQuery(q: Query): string {
  const cat = CATEGORIES.find((c) => c.id === q.category);
  let noun = cat ? cat.label.toLowerCase() : NOUN[q.tab];
  if (cat && q.tab === "bridal") noun = `bridal ${noun}`;
  if (q.purity.length === 1) noun = `${q.purity[0]} ${noun}`;
  const where = q.location ? (areaBySlug.has(q.location) ? areaBySlug.get(q.location)!.name : locationLabel(q.location)) : "the UAE";
  const text = `${noun} in ${where}`;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

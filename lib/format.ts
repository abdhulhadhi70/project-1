import type { MakingCharge, Price } from "@/data/catalogue";

const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const aed = (amount: number) => `AED ${grouped.format(amount)}`;

export function priceText(price: Price): string {
  return price.kind === "on_request" ? "Request price" : aed(price.aed);
}

export function makingChargeText(m: MakingCharge): string {
  switch (m.type) {
    case "per_gram": return `${aed(m.aed)} per gram`;
    case "percent": return `${m.value}% of the gold value`;
    case "fixed": return `${aed(m.aed)}, fixed`;
  }
}

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dubai" });
export const dateText = (iso: string) => day.format(new Date(`${iso}T12:00:00+04:00`));

export const weightText = (g: number) => `${g.toLocaleString("en-US", { maximumFractionDigits: 2 })} g`;

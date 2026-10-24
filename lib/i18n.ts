import "server-only";
import en from "@/messages/en.json";

// English ships now. To add Arabic or Malayalam: create messages/ar.json (or
// ml.json) with the same keys, then move it from `planned` into `locales`.
export const locales = ["en"] as const;
export const plannedLocales = ["ar", "ml"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const rtl = new Set<string>(["ar"]);
export const dirFor = (locale: string) => (rtl.has(locale) ? "rtl" : "ltr");

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export type Messages = typeof en;
const dictionaries: Record<Locale, Messages> = { en };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

// t(messages.rates.asOf, { time: "09:00" }) -> "As of 09:00"
export function t(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

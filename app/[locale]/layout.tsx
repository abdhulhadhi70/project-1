import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { dirFor, getMessages, isLocale, locales } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const m = getMessages(locale);
  return {
    title: { default: m.site.name, template: `%s · ${m.site.name}` },
    description: m.site.description,
  };
}

export const viewport: Viewport = { themeColor: "#1c1a17", width: "device-width", initialScale: 1 };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const m = getMessages(locale);

  return (
    <html lang={locale} dir={dirFor(locale)} className={`${cormorant.variable} ${inter.variable}`}>
      <body className="min-h-dvh flex flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 bg-charcoal text-ivory px-3 py-2 rounded">
          {m.nav.skipToContent}
        </a>
        <SiteHeader locale={locale} messages={m} />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter messages={m} />
      </body>
    </html>
  );
}

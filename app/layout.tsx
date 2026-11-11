import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Jost } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LiveCatalogue } from "@/components/LiveCatalogue";
import { site } from "@/data/site";
import "./globals.css";

// Bodoni for headlines (the fashion-magazine serif), Jost for everything else.
const serif = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const sans = Jost({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.descriptor}`, template: `%s · ${site.name}` },
  description: site.description,
  // A prototype full of invented shops should not be indexed as if it were real.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0c2620", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh bg-chalk antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-ink focus:px-3 focus:py-2 focus:text-chalk">
          Skip to content
        </a>
        <LiveCatalogue />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

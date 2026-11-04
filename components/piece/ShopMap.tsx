"use client";
import dynamic from "next/dynamic";
import type { Shop } from "@/data/catalogue";

const ResultsMap = dynamic(() => import("../search/ResultsMap"), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-limestone" />,
});

export function ShopMap({ shop, className = "h-64" }: { shop: Shop; className?: string }) {
  const initials = shop.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2);
  return (
    <div className={className}>
      <ResultsMap shops={[{ shop, count: 1, label: initials }]} className="size-full border border-line" />
    </div>
  );
}

"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ShopView } from "@/components/jewellers/ShopView";

function FromQuery() {
  return <ShopView slug={useSearchParams().get("slug") ?? ""} />;
}

export default function JewellerPage() {
  return <Suspense fallback={<p className="page page-x py-24 text-center text-[14px] text-stone">Loading…</p>}><FromQuery /></Suspense>;
}

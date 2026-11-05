"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { PieceView } from "@/components/piece/PieceView";

function FromQuery() {
  const slug = useSearchParams().get("slug") ?? "";
  return <PieceView slug={slug} />;
}

export default function PiecePage() {
  return <Suspense fallback={<p className="page page-x py-24 text-center text-[14px] text-stone">Loading…</p>}><FromQuery /></Suspense>;
}

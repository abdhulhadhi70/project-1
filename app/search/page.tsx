import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/search/SearchView";

export const metadata: Metadata = { title: "Search gold jewellery" };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="page page-x py-20 text-center text-[14px] text-stone">Loading results…</div>}>
      <SearchView />
    </Suspense>
  );
}

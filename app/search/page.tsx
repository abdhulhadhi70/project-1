import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchStatic, SearchView } from "@/components/search/SearchView";

export const metadata: Metadata = { title: "Search gold jewellery" };

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchStatic />}>
      <SearchView />
    </Suspense>
  );
}

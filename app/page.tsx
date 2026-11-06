import { Suspense } from "react";
import { SearchView } from "@/components/search/SearchView";

// The site opens straight on the listings, Property Finder style: search,
// filters, pieces. Everything else is one tap away from a listing.
export default function Home() {
  return (
    <Suspense fallback={<div className="page page-x py-20 text-center text-[14px] text-stone">Loading pieces…</div>}>
      <SearchView />
    </Suspense>
  );
}

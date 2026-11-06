import { Suspense } from "react";
import { SearchStatic, SearchView } from "@/components/search/SearchView";

// The site opens straight on the listings, Property Finder style: search,
// categories, pieces. The static page already shows every piece, so there
// is no loading screen before the first one.
export default function Home() {
  return (
    <Suspense fallback={<SearchStatic />}>
      <SearchView />
    </Suspense>
  );
}

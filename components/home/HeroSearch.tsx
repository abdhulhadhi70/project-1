"use client";
// The homepage search: one rounded bar with suggestions and a gold Search
// button. Choosing a suggestion, pressing Enter or pressing Search all go
// straight to the results; the filters live there.
import { useRouter } from "next/navigation";
import { EMPTY_QUERY, searchHref, type Query } from "@/lib/catalogue-query";
import { SearchIcon } from "../Icons";
import { LocationBox } from "../search/LocationBox";

export function HeroSearch() {
  const router = useRouter();
  const go = (patch: Partial<Query>) => {
    // Clearing the box is not a search.
    if (Object.keys(patch).length === 1 && patch.q === "") return;
    router.push(searchHref({ ...EMPTY_QUERY, ...patch }));
  };
  return (
    <div className="rounded-full bg-chalk p-1.5 text-ink shadow-[0_18px_40px_-18px_rgb(0_0_0/0.8)]">
      <LocationBox query={EMPTY_QUERY} set={go} size="lg" bare placeholder="Area, souk, jeweller or piece"
        trailing={
          <button type="submit" className="btn-gold ml-1 inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-5 text-[14px] font-medium">
            <SearchIcon className="size-4" /> Search
          </button>
        } />
    </div>
  );
}

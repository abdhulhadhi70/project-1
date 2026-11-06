"use client";
// The search lives in the URL, so a filtered view can be shared or
// bookmarked and the back button behaves. Every search control on the site
// writes here; off the listings, a change takes you to them. The listings
// are the front page; /search still works for links saved before that.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { EMPTY_QUERY, parseQuery, toSearchParams, type Query } from "./catalogue-query";

export function useQueryState() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const onSearch = pathname === "/" || pathname === "/search";
  const query = useMemo(
    () => (onSearch ? parseQuery(new URLSearchParams(params.toString())) : EMPTY_QUERY),
    [params, onSearch],
  );

  const set = useCallback(
    (patch: Partial<Query>) => {
      // Any change other than turning the page starts again at page 1.
      const next: Query = { ...query, page: 1, ...patch };
      const qs = toSearchParams(next).toString();
      const href = `${pathname === "/search" ? "/search" : "/"}${qs ? `?${qs}` : ""}`;
      if (onSearch) router.replace(href, { scroll: "page" in patch });
      else router.push(href);
    },
    [query, onSearch, router, pathname],
  );

  const reset = useCallback(() => set({ ...EMPTY_QUERY, tab: query.tab, sort: query.sort }), [set, query.tab, query.sort]);

  return { query, set, reset };
}

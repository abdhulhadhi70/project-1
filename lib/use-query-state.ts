"use client";
// The catalogue's state lives in the URL, so a filtered view can be shared
// or bookmarked and the back button behaves.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { EMPTY_QUERY, parseQuery, toSearchParams, type Query } from "./catalogue-query";

export function useQueryState() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = useMemo(() => parseQuery(new URLSearchParams(params.toString())), [params]);

  const set = useCallback(
    (patch: Partial<Query>, { jump = false }: { jump?: boolean } = {}) => {
      const next = toSearchParams({ ...query, ...patch }).toString();
      if (pathname === "/") {
        router.replace(next ? `/?${next}` : "/", { scroll: false });
        if (jump) document.getElementById("pieces")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // Searching from a product or shop page takes you back to the catalogue.
        router.push(`/${next ? `?${next}` : ""}#pieces`);
      }
    },
    [query, pathname, router],
  );

  const reset = useCallback(
    () => set({ ...EMPTY_QUERY, sort: query.sort }),
    [set, query.sort],
  );

  return { query, set, reset };
}

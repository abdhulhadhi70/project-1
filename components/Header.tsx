import { Suspense } from "react";
import { site } from "@/data/site";
import { LocationSelect } from "./LocationSelect";
import { SavedLink } from "./SavedLink";
import { SearchField } from "./SearchField";
import { Wordmark } from "./Wordmark";

function Shell({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

export function Header() {
  return (
    <>
      <p className="bg-limestone page-x py-1.5 text-center text-[12px] leading-snug text-stone">
        <span className="hidden sm:inline">{site.demoNotice}</span>
        <span className="sm:hidden">{site.demoNoticeShort}</span>
      </p>
      <header className="sticky top-0 z-30 border-b border-line bg-chalk">
        {/* Desktop: one quiet line. */}
        <div className="page page-x hidden h-16 grid-cols-[1fr_minmax(0,34rem)_1fr] items-center gap-8 md:grid">
          <Wordmark withDescriptor />
          <Suspense fallback={<div className="h-10 rounded-[3px] bg-limestone" />}>
            <SearchField />
          </Suspense>
          <div className="flex items-center justify-end gap-7">
            <Suspense fallback={null}>
              <LocationSelect />
            </Suspense>
            <SavedLink />
          </div>
        </div>
        {/* Phone: name and place on one line, search on its own line. Saved
            lives in the bottom bar, where a thumb can reach it. */}
        <div className="page-x md:hidden">
          <div className="flex h-12 items-center justify-between">
            <Wordmark />
            <Suspense fallback={<Shell />}>
              <LocationSelect compact />
            </Suspense>
          </div>
          <Suspense fallback={<div className="mb-2.5 h-10 rounded-[3px] bg-limestone" />}>
            <SearchField className="pb-2.5" />
          </Suspense>
        </div>
      </header>
    </>
  );
}

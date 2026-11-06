"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";
import { site } from "@/data/site";
import { liveTabs, searchHref } from "@/lib/catalogue-query";
import { useSaved } from "@/lib/saved";
import { useCatalogue } from "@/lib/catalogue-store";
import { HeartIcon, MenuIcon } from "./Icons";
import { Sheet, type SheetHandle } from "./Sheet";
import { Wordmark } from "./Wordmark";

const nav = (): { href: string; label: string; tab?: string }[] => [
  ...liveTabs().map((t) => ({ href: searchHref({ tab: t.id }), label: t.label, tab: t.id })),
  { href: "/jewellers", label: "Jewellers" },
  { href: "/gold-price", label: "Gold price" },
];

function NavLinks({ onClick, className, item }: { onClick?: () => void; className: string; item: (active: boolean) => string }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "jewellery";
  useCatalogue();
  return (
    <ul className={className}>
      {nav().map((n) => {
        const active = n.tab ? pathname === "/search" && tab === n.tab : pathname.startsWith(n.href);
        return (
          <li key={n.label}>
            <Link href={n.href} onClick={onClick} aria-current={active ? "page" : undefined} className={item(active)}>{n.label}</Link>
          </li>
        );
      })}
    </ul>
  );
}

function SavedCount() {
  const { saved } = useSaved();
  return saved.length > 0 ? (
    <span className="absolute -right-1.5 -top-1 min-w-4 rounded-full bg-terracotta px-1 text-center text-[10px] leading-4 text-white">{saved.length}</span>
  ) : null;
}

export function Header() {
  const menu = useRef<SheetHandle>(null);
  const { settings, shops } = useCatalogue();
  // The notice line: the admin's text once set, otherwise the demo notice
  // for as long as any demo shop is on the site.
  const notice = settings ? (settings.showNotice ? settings.noticeText : null) : null;
  const showDemo = !notice && shops.some((s) => s.demo) && (settings?.showNotice ?? true);
  return (
    <>
      {(notice || showDemo) && (
        <p className="border-b border-cocoa-line bg-cocoa page-x py-1.5 text-center text-[12px] leading-snug text-cream-soft">
          {notice ?? (<><span className="hidden sm:inline">{site.demoNotice}</span><span className="sm:hidden">{site.demoNoticeShort}</span></>)}
        </p>
      )}
      <header className="sticky top-0 z-30 h-[var(--header-h)] border-b border-cocoa-line bg-cocoa/95 text-cream backdrop-blur-sm">
        <div className="page page-x flex h-full items-center gap-8">
          <Wordmark withDescriptor tone="dark" />
          <nav aria-label="Main" className="hidden flex-1 lg:block">
            <Suspense fallback={null}>
              <NavLinks className="flex gap-7 text-[14px]" item={(a) => `relative py-5 ${a ? "text-cream after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-gold" : "text-cream-soft hover:text-cream"}`} />
            </Suspense>
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:gap-5">
            <Link href="/saved" className="relative inline-flex h-10 items-center gap-2 px-2 text-[14px] text-cream hover:text-gold" aria-label="Saved pieces and searches">
              <span className="relative"><HeartIcon className="size-5" /><SavedCount /></span>
              <span className="hidden lg:inline">Saved</span>
            </Link>
            <Link href="/for-jewellers" className="hidden h-10 items-center rounded-full bg-terracotta px-5 text-[14px] text-white transition-colors hover:bg-terracotta-deep lg:inline-flex">
              List your shop
            </Link>
            <button type="button" onClick={() => menu.current?.open()} className="-mr-2 grid size-11 place-items-center text-cream lg:hidden" aria-label="Menu">
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>
      <Sheet ref={menu} title="Menu">
        <Suspense fallback={null}>
          <NavLinks onClick={() => menu.current?.close()} className="divide-y divide-line border-y border-line"
            item={(a) => `flex h-12 items-center text-[16px] ${a ? "text-ink" : "text-ink-soft"}`} />
        </Suspense>
        <div className="mt-5 grid gap-2">
          <Link href="/saved" onClick={() => menu.current?.close()} className="inline-flex h-11 items-center justify-center rounded-full border border-line-strong text-[14px]">Saved</Link>
          <Link href="/for-jewellers" onClick={() => menu.current?.close()} className="inline-flex h-11 items-center justify-center rounded-full bg-terracotta text-[14px] text-white">List your shop</Link>
        </div>
      </Sheet>
    </>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/lib/saved";
import { GridIcon, HeartIcon, StoreIcon } from "./Icons";

// Phone only. Hidden on a product page, which has its own contact bar.
export function BottomNav() {
  const pathname = usePathname();
  const { saved } = useSaved();
  if (pathname.startsWith("/pieces/")) return null;
  const items = [
    { href: "/", label: "Explore", icon: GridIcon, active: pathname === "/" || pathname.startsWith("/jewellers") },
    { href: "/saved", label: "Saved", icon: HeartIcon, active: pathname === "/saved", badge: saved.length },
    { href: "/for-jewellers", label: "For jewellers", icon: StoreIcon, active: pathname === "/for-jewellers" },
  ];
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-chalk pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-3">
        {items.map(({ href, label, icon: Icon, active, badge }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] ${active ? "text-ink" : "text-stone"}`}
            >
              <span className="relative">
                <Icon className="size-[21px]" />
                {badge ? (
                  <span className="absolute -right-2.5 -top-1 min-w-4 rounded-full bg-ink px-1 text-center text-[10px] leading-4 text-chalk">{badge}</span>
                ) : null}
              </span>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

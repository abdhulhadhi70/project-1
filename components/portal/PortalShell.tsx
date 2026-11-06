"use client";
// The frame around every portal page: makes sure someone is signed in with
// the right access, shows the portal's sections, and (for jewellers who
// belong to more than one shop) which shop they are working on.
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { useAccount, type Membership } from "@/lib/use-account";
import { Notice } from "./ui";

type Ctx = { shop: Membership; isAdmin: boolean; email: string };
const ShopContext = createContext<Ctx | null>(null);
export const usePortalShop = () => {
  const c = useContext(ShopContext);
  if (!c) throw new Error("usePortalShop outside the jeweller portal");
  return c;
};

const AdminContext = createContext<{ email: string } | null>(null);
export const useAdmin = () => useContext(AdminContext);

type Section = { href: string; label: string };

function Frame({ title, sections, aside, children }: { title: string; sections: Section[]; aside?: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="pb-16">
      <div className="cocoa-glow text-cream">
      <div className="page page-x pt-5 md:pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] text-gold">{title}</p>
          <div className="mt-1">{aside}</div>
        </div>
        <button type="button" onClick={async () => { await getSupabase().auth.signOut(); router.replace("/login"); }}
          className="h-10 rounded-full border border-cocoa-line px-4 text-[13px] text-cream-soft hover:border-gold hover:text-cream">Sign out</button>
      </div>
      <nav aria-label={title} className="no-scrollbar -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0">
        {sections.map((s) => {
          const on = s.href === pathname || (s.href !== sections[0].href && pathname.startsWith(s.href));
          return (
            <Link key={s.href} href={s.href} aria-current={on ? "page" : undefined}
              className={`inline-flex h-10 shrink-0 items-center rounded-full px-4 text-[14px] transition-colors ${on ? "bg-cream text-ink" : "text-cream-soft hover:bg-cocoa-2 hover:text-cream"}`}>
              {s.label}
            </Link>
          );
        })}
      </nav>
      </div>
      </div>
      <div className="page page-x mt-6">{children}</div>
    </div>
  );
}

function Gate({ children }: { children: (a: Extract<ReturnType<typeof useAccount>, { state: "signed_in" }>) => React.ReactNode }) {
  const account = useAccount();
  const router = useRouter();
  useEffect(() => { if (account.state === "signed_out") router.replace("/login"); }, [account.state, router]);
  if (!supabaseConfigured || account.state === "unconfigured") return <div className="page page-x py-16"><Notice>The portal isn&apos;t connected to the database in this build.</Notice></div>;
  if (account.state !== "signed_in") return <p className="page page-x py-24 text-center text-[14px] text-stone">Loading…</p>;
  return <>{children(account)}</>;
}

const JEWELLER: Section[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/pieces", label: "Pieces" },
  { href: "/dashboard/requests", label: "Visit requests" },
  { href: "/dashboard/shop", label: "Shop profile" },
  { href: "/dashboard/team", label: "Team" },
];

export function JewellerPortal({ children }: { children: React.ReactNode }) {
  const [chosen, setChosen] = useState<string | null>(null);
  useEffect(() => { try { setChosen(localStorage.getItem("tibr:shop")); } catch { /* ignore */ } }, []);
  return (
    <Gate>
      {(a) => {
        if (!a.shops.length) {
          return (
            <div className="page page-x py-16">
              <Notice>
                {a.isAdmin
                  ? <>You&apos;re an admin without a shop of your own. <Link href="/admin" className="underline">Open the admin portal</Link>.</>
                  : "Your account isn't linked to a shop yet. Ask your shop's owner, or our team, to add this email address."}
              </Notice>
            </div>
          );
        }
        const shop = a.shops.find((s) => s.shopId === chosen) ?? a.shops[0];
        const switcher = a.shops.length > 1 ? (
          <select value={shop.shopId} aria-label="Shop"
            onChange={(e) => { setChosen(e.target.value); try { localStorage.setItem("tibr:shop", e.target.value); } catch { /* ignore */ } }}
            className="mt-0.5 h-11 rounded-xl border border-cocoa-line bg-cocoa-2 px-3 font-serif text-[20px] text-cream">
            {a.shops.map((s) => <option key={s.shopId} value={s.shopId}>{s.shopName}</option>)}
          </select>
        ) : <p className="font-serif text-[26px] leading-none md:text-[30px]">{shop.shopName}</p>;
        return (
          <ShopContext.Provider value={{ shop, isAdmin: a.isAdmin, email: a.email }}>
            <Frame title={`Jeweller portal · ${shop.role === "owner" ? "Owner" : "Staff"}`} sections={JEWELLER} aside={switcher}>
              {children}
            </Frame>
          </ShopContext.Provider>
        );
      }}
    </Gate>
  );
}

const ADMIN: Section[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/shops", label: "Jewellers" },
  { href: "/admin/pieces", label: "Pieces" },
  { href: "/admin/rates", label: "Gold rates" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/requests", label: "Visit requests" },
  { href: "/admin/settings", label: "Site settings" },
  { href: "/admin/areas", label: "Areas" },
  { href: "/admin/users", label: "Users" },
];

export function AdminPortal({ children }: { children: React.ReactNode }) {
  return (
    <Gate>
      {(a) => a.isAdmin ? (
        <AdminContext.Provider value={{ email: a.email }}>
          <Frame title="Admin portal" sections={ADMIN} aside={<p className="font-serif text-[26px] leading-none md:text-[30px]">Everything on the site</p>}>
            {children}
          </Frame>
        </AdminContext.Provider>
      ) : (
        <div className="page page-x py-16"><Notice tone="error">This area is for our team. Your account doesn&apos;t have admin access.</Notice></div>
      )}
    </Gate>
  );
}

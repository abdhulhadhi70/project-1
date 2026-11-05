"use client";
// Where everyone lands after signing in. Until the portals exist (Steps 3
// and 4), it shows who you are and what you have access to.
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuthShell, NotConnected, Notice } from "@/components/auth/AuthShell";
import { getSupabase } from "@/lib/supabase";
import { useAccount } from "@/lib/use-account";
import { shopHref } from "@/lib/links";

function Account() {
  const account = useAccount();
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => { if (account.state === "signed_out") router.replace("/login"); }, [account.state, router]);

  if (account.state === "unconfigured") return <NotConnected />;
  if (account.state !== "signed_in") return <Notice>Loading your account…</Notice>;
  return (
    <div className="space-y-5">
      {params.get("password") === "updated" && <Notice tone="ok">Your password has been changed.</Notice>}
      <dl className="divide-y divide-line border-y border-line text-[14px]">
        <div className="grid grid-cols-[7rem_1fr] gap-3 py-2.5"><dt className="text-stone">Signed in as</dt><dd>{account.name ? `${account.name} · ` : ""}{account.email}</dd></div>
        <div className="grid grid-cols-[7rem_1fr] gap-3 py-2.5"><dt className="text-stone">Access</dt><dd>{account.isAdmin ? "Admin: the whole site" : account.shops.length ? "Jeweller" : "None yet"}</dd></div>
        {account.shops.map((s) => (
          <div key={s.shopId} className="grid grid-cols-[7rem_1fr] gap-3 py-2.5">
            <dt className="text-stone">Shop</dt>
            <dd><Link href={shopHref(s.shopSlug)} className="underline decoration-line-strong underline-offset-4">{s.shopName}</Link> · {s.role === "owner" ? "Owner" : "Staff"}</dd>
          </div>
        ))}
      </dl>
      {!account.isAdmin && account.shops.length === 0 && (
        <Notice>Your account isn&apos;t linked to a shop yet. Ask your shop&apos;s owner, or our team, to invite this email address.</Notice>
      )}
      <p className="text-[13px] text-stone">The jeweller portal and the admin portal open here once they are built.</p>
      <button type="button" onClick={async () => { await getSupabase().auth.signOut(); router.replace("/login"); }}
        className="h-11 border border-ink px-5 text-[14px] hover:bg-ink hover:text-chalk">Sign out</button>
    </div>
  );
}

export default function AccountPage() {
  return (
    <AuthShell title="Your account">
      <Suspense fallback={<Notice>Loading your account…</Notice>}><Account /></Suspense>
    </AuthShell>
  );
}

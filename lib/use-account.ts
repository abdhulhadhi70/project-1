"use client";
// The signed-in person: their session, role, and the shops they belong to.
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { getSupabase, supabaseConfigured } from "./supabase";

export type Membership = { shopId: string; shopName: string; shopSlug: string; role: "owner" | "staff" };
export type Account =
  | { state: "loading" }
  | { state: "unconfigured" }
  | { state: "signed_out" }
  | { state: "signed_in"; session: Session; email: string; name: string | null; isAdmin: boolean; shops: Membership[] };

async function load(session: Session): Promise<Account> {
  const sb = getSupabase();
  const uid = session.user.id;
  const [profile, members] = await Promise.all([
    sb.from("profiles").select("role, full_name").eq("id", uid).maybeSingle(),
    sb.from("shop_members").select("role, shops(id, name, slug)").eq("user_id", uid),
  ]);
  type Row = { role: "owner" | "staff"; shops: { id: string; name: string; slug: string } | null };
  const shops = ((members.data ?? []) as unknown as Row[])
    .filter((r) => r.shops)
    .map((r) => ({ shopId: r.shops!.id, shopName: r.shops!.name, shopSlug: r.shops!.slug, role: r.role }));
  return {
    state: "signed_in", session, email: session.user.email ?? "",
    name: profile.data?.full_name ?? null, isAdmin: profile.data?.role === "admin", shops,
  };
}

export function useAccount(): Account {
  const [account, setAccount] = useState<Account>(supabaseConfigured ? { state: "loading" } : { state: "unconfigured" });
  useEffect(() => {
    if (!supabaseConfigured) return;
    const sb = getSupabase();
    let live = true;
    const apply = async (session: Session | null) => {
      const next = session ? await load(session) : ({ state: "signed_out" } as const);
      if (live) setAccount(next);
    };
    sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => { void apply(session); });
    return () => { live = false; sub.subscription.unsubscribe(); };
  }, []);
  return account;
}

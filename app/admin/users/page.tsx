"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/portal/PortalShell";
import { Card, Notice } from "@/components/portal/ui";
import { allMemberships, listShops, listUsers, setUserRole, type UserRow } from "@/lib/admin";
import { dateText } from "@/lib/format";
import type { ShopRow } from "@/lib/portal";

export default function Users() {
  const me = useAdmin();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [members, setMembers] = useState<{ shop_id: string; user_id: string; role: string }[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([listUsers(), listShops(), allMemberships()]).then(([u, s, m]) => { setUsers(u); setShops(s); setMembers(m); }).catch((e) => setError(e.message));
  }, []);
  if (!users) return error ? <Notice tone="error">{error}</Notice> : <p className="text-[14px] text-stone">Loading…</p>;
  return (
    <div className="space-y-4">
      {error && <Notice tone="error">{error}</Notice>}
      <Card title={`${users.length} accounts`}>
        <ul className="divide-y divide-line border-y border-line text-[14px]">
          {users.map((u) => {
            const theirs = members.filter((m) => m.user_id === u.id);
            return (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate">{u.full_name ? `${u.full_name} · ` : ""}{u.email}</span>
                  <span className="text-[12px] text-stone">
                    Joined {dateText(u.created_at)} · {theirs.length ? theirs.map((m, i) => (
                      <span key={m.shop_id}>{i > 0 && ", "}<Link href={`/admin/shop?id=${m.shop_id}`} className="underline">{shops.find((s) => s.id === m.shop_id)?.name ?? "shop"}</Link> ({m.role})</span>
                    )) : "no shop"}
                  </span>
                </span>
                <select aria-label={`Role for ${u.email}`} value={u.role} disabled={u.email === me?.email}
                  className="h-10 border border-line-strong bg-chalk px-2 text-[13px] disabled:opacity-50"
                  onChange={async (e) => {
                    const role = e.target.value as UserRow["role"];
                    if (role === "admin" && !confirm(`Make ${u.email} an admin? They will be able to change everything on the site.`)) return;
                    try { const r = await setUserRole(u.id, role); setUsers(users.map((x) => (x.id === u.id ? r : x))); } catch (err) { setError((err as Error).message); }
                  }}>
                  <option value="jeweller">Jeweller</option><option value="admin">Admin</option>
                </select>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-[12px] text-stone">New accounts appear here after sign-up. To give someone a shop, open the shop under Jewellers and add them there.</p>
      </Card>
    </div>
  );
}

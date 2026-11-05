"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Empty, Notice, input } from "@/components/portal/ui";
import { listShops } from "@/lib/admin";
import { dateText } from "@/lib/format";
import type { ShopRow } from "@/lib/portal";

export default function AdminShops() {
  const [shops, setShops] = useState<ShopRow[] | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  useEffect(() => { listShops().then(setShops).catch((e) => setError(e.message)); }, []);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!shops) return <p className="text-[14px] text-stone">Loading…</p>;
  const shown = shops.filter((s) => `${s.name} ${s.area}`.toLowerCase().includes(text.toLowerCase()));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[12rem] flex-1 text-[13px] text-stone">Search<input className={input} value={text} onChange={(e) => setText(e.target.value)} /></label>
        <Link href="/admin/shop" className="inline-flex h-12 items-center bg-ink px-4 text-[14px] text-chalk hover:bg-ink-soft">+ New jeweller</Link>
      </div>
      {!shown.length ? <Empty title="No jewellers match." /> : (
        <ul className="divide-y divide-line border-y border-line">
          {shown.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/shop?id=${s.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:bg-limestone/40">
                <span>
                  <span className="block text-[15px] text-ink">{s.name}</span>
                  <span className="text-[12px] text-stone">{s.area} · {s.plan} plan · added {dateText(s.created_at)}</span>
                </span>
                <span className="flex flex-wrap gap-1.5 text-[12px]">
                  {!s.is_approved && <span className="bg-[#f3ead8] px-2 py-0.5 text-[#6b4f1d]">Waiting for approval</span>}
                  {!s.is_active && <span className="bg-limestone px-2 py-0.5 text-stone">Suspended</span>}
                  {s.is_demo && <span className="bg-limestone px-2 py-0.5 text-stone">Demo</span>}
                  {s.featured_order !== null && <span className="bg-ink px-2 py-0.5 text-chalk">Featured #{s.featured_order}</span>}
                  {s.is_approved && s.is_active && !s.is_demo && <span className="bg-[#e6eee6] px-2 py-0.5 text-[#2f5130]">Live</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

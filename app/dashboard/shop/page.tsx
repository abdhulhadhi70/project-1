"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePortalShop } from "@/components/portal/PortalShell";
import { ShopEditor } from "@/components/portal/ShopEditor";
import { Flash, Notice, useFlash } from "@/components/portal/ui";
import { loadLiveCatalogue } from "@/lib/catalogue-store";
import { shopHref } from "@/lib/links";
import { getShop, updateShop, type ShopRow } from "@/lib/portal";

export default function ShopProfile() {
  const { shop } = usePortalShop();
  const [row, setRow] = useState<ShopRow | null>(null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useFlash();
  useEffect(() => { getShop(shop.shopId).then(setRow).catch((e) => setError(e.message)); }, [shop.shopId]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!row) return <p className="text-[14px] text-stone">Loading…</p>;
  return (
    <div className="space-y-4">
      {row.is_demo && <Notice tone="warn">This is a demonstration shop: customers see it labelled as demo, and contact buttons send nothing.</Notice>}
      {!row.is_approved && <Notice tone="warn">Your shop is waiting for approval by our team, so it isn&apos;t on the site yet.</Notice>}
      <p className="text-[13px] text-stone">What customers see on <Link href={shopHref(row.slug)} className="underline">your shop page</Link> and beside every piece.</p>
      <ShopEditor key={row.id} initial={row} onSave={async (patch) => { setRow(await updateShop(row.id, patch)); setFlash("Saved. It's on the site now."); void loadLiveCatalogue(true); }} />
      <Flash message={flash} />
    </div>
  );
}

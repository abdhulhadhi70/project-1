"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAdmin } from "@/components/portal/PortalShell";
import { ShopEditor, blankShop } from "@/components/portal/ShopEditor";
import { TeamPanel } from "@/components/portal/TeamPanel";
import { Flash, Notice, useFlash } from "@/components/portal/ui";
import { createShop } from "@/lib/admin";
import { loadLiveCatalogue } from "@/lib/catalogue-store";
import { getShop, updateShop, type ShopRow } from "@/lib/portal";

function Edit() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const admin = useAdmin();
  const [row, setRow] = useState<ShopRow | null | undefined>(id ? undefined : null);
  const [error, setError] = useState("");
  const [flash, setFlash] = useFlash();
  useEffect(() => { if (id) getShop(id).then(setRow).catch((e) => setError(e.message)); }, [id]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (row === undefined) return <p className="text-[14px] text-stone">Loading…</p>;
  return (
    <div className="space-y-6">
      <p className="text-[13px] text-stone"><Link href="/admin/shops" className="underline">Jewellers</Link> › {row ? row.name : "New jeweller"}</p>
      {!row && <Notice>New jewellers start unapproved: approve them once their profile and first pieces are ready.</Notice>}
      <ShopEditor key={row?.id ?? "new"} admin initial={row ?? blankShop()} saveLabel={row ? "Save changes" : "Create jeweller"}
        onSave={async (patch) => {
          if (row) { setRow(await updateShop(row.id, patch)); setFlash("Saved."); }
          else { const created = await createShop(patch); router.replace(`/admin/shop?id=${created.id}`); setFlash("Created. Now add its owner below."); }
          void loadLiveCatalogue(true);
        }} />
      {row && (
        <>
          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/pieces?shop=${row.id}`} className="inline-flex h-11 items-center rounded-full border border-ink px-5 text-[14px] hover:bg-limestone">Their pieces</Link>
            <Link href={`/admin/piece?shop=${row.id}`} className="inline-flex h-11 items-center rounded-full border border-ink px-5 text-[14px] hover:bg-limestone">+ Add a piece for them</Link>
            <Link href={`/admin/report?shop=${row.id}`} className="inline-flex h-11 items-center rounded-full border border-ink px-5 text-[14px] hover:bg-limestone">Report</Link>
          </div>
          <TeamPanel shopId={row.id} canManage canAddOwner me={admin?.email ?? ""} />
        </>
      )}
      <Flash message={flash} />
    </div>
  );
}

export default function AdminShop() {
  return <Suspense fallback={<p className="text-[14px] text-stone">Loading…</p>}><Edit /></Suspense>;
}

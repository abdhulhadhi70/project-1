"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PieceEditor } from "@/components/portal/PieceEditor";
import { usePortalShop } from "@/components/portal/PortalShell";
import { Notice } from "@/components/portal/ui";
import { loadLiveCatalogue } from "@/lib/catalogue-store";
import { getPiece, type PieceRow } from "@/lib/portal";

function Edit() {
  const { shop } = usePortalShop();
  const id = useSearchParams().get("id");
  const router = useRouter();
  const [piece, setPiece] = useState<PieceRow | null | undefined>(id ? undefined : null);
  const [error, setError] = useState("");
  useEffect(() => { if (id) getPiece(id).then(setPiece).catch((e) => setError(e.message)); }, [id]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (piece === undefined) return <p className="text-[14px] text-stone">Loading…</p>;
  if (id && (!piece || piece.shop_id !== shop.shopId)) return <Notice tone="error">This piece isn&apos;t in {shop.shopName}.</Notice>;
  return (
    <div>
      <p className="mb-4 text-[13px] text-stone"><Link href="/dashboard/pieces" className="underline">Pieces</Link> › {piece ? `${piece.name} (${piece.code})` : "Add a piece"}</p>
      <PieceEditor key={piece?.id ?? "new"} shopId={shop.shopId} shopName={shop.shopName} existing={piece ?? undefined}
        onSaved={() => { void loadLiveCatalogue(true); router.push("/dashboard/pieces?saved=1"); }} />
    </div>
  );
}

export default function PiecePage() {
  return <Suspense fallback={<p className="text-[14px] text-stone">Loading…</p>}><Edit /></Suspense>;
}

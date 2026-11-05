"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PieceEditor } from "@/components/portal/PieceEditor";
import { Notice } from "@/components/portal/ui";
import { loadLiveCatalogue } from "@/lib/catalogue-store";
import { getPiece, getShop, type PieceRow, type ShopRow } from "@/lib/portal";

function Edit() {
  const params = useSearchParams();
  const id = params.get("id");
  const router = useRouter();
  const [piece, setPiece] = useState<PieceRow | null | undefined>(id ? undefined : null);
  const [shop, setShop] = useState<ShopRow | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    (async () => {
      const p = id ? await getPiece(id) : null;
      setPiece(p);
      const shopId = p?.shop_id ?? params.get("shop");
      if (!shopId) throw new Error("Choose a jeweller first, from Pieces or Jewellers.");
      setShop(await getShop(shopId));
    })().catch((e) => setError(e.message));
  }, [id, params]);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (piece === undefined || !shop) return <p className="text-[14px] text-stone">Loading…</p>;
  return (
    <div>
      <p className="mb-4 text-[13px] text-stone">
        <Link href={`/admin/pieces?shop=${shop.id}`} className="underline">Pieces</Link> › {shop.name} › {piece ? `${piece.name} (${piece.code})` : "Add a piece"}
      </p>
      <PieceEditor admin key={piece?.id ?? "new"} shopId={shop.id} shopName={shop.name} existing={piece ?? undefined}
        onSaved={() => { void loadLiveCatalogue(true); router.push(`/admin/pieces?shop=${shop.id}`); }} />
    </div>
  );
}

export default function AdminPiece() {
  return <Suspense fallback={<p className="text-[14px] text-stone">Loading…</p>}><Edit /></Suspense>;
}

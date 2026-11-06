"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePortalShop } from "@/components/portal/PortalShell";
import { ResultsPanel } from "@/components/portal/ResultsPanel";
import { Button, Card, Flash, Notice, useFlash } from "@/components/portal/ui";
import { loadLiveCatalogue } from "@/lib/catalogue-store";
import { dateText } from "@/lib/format";
import { confirmStock, listPieces, listRequests, type PieceRow } from "@/lib/portal";

const DAY = 86400_000;

export default function Overview() {
  const { shop } = usePortalShop();
  const [pieces, setPieces] = useState<PieceRow[] | null>(null);
  const [newRequests, setNewRequests] = useState(0);
  const [flash, setFlash] = useFlash();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = () => {
    listPieces(shop.shopId).then(setPieces).catch((e) => setError(e.message));
    listRequests(shop.shopId).then((r) => setNewRequests(r.filter((x) => x.status === "new").length)).catch(() => {});
  };
  useEffect(load, [shop.shopId]);

  const shown = pieces?.filter((p) => p.status === "available" || p.status === "reserved_in_store") ?? [];
  const oldest = shown.reduce<string | null>((m, p) => (!m || p.stock_confirmed_at < m ? p.stock_confirmed_at : m), null);
  const hiddenSoon = shown.filter((p) => Date.now() - new Date(p.stock_confirmed_at).getTime() > 25 * DAY).length;
  const hiddenNow = shown.filter((p) => Date.now() - new Date(p.stock_confirmed_at).getTime() > 30 * DAY).length;

  return (
    <div className="space-y-5">
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <Card title="Confirm your stock">
          <p className="text-[14px] text-ink-soft">
            One tap tells customers everything you show is still in the shop. Pieces not confirmed for 30 days are hidden from the site until you confirm again.
          </p>
          {hiddenNow > 0 && <div className="mt-3"><Notice tone="error">{hiddenNow} {hiddenNow === 1 ? "piece is" : "pieces are"} hidden because stock wasn&apos;t confirmed for 30 days.</Notice></div>}
          {!hiddenNow && hiddenSoon > 0 && <div className="mt-3"><Notice tone="warn">{hiddenSoon} {hiddenSoon === 1 ? "piece" : "pieces"} will be hidden within 5 days unless you confirm.</Notice></div>}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Button disabled={busy || !shown.length} onClick={async () => {
              setBusy(true);
              try {
                const n = await confirmStock(shop.shopId);
                setFlash(`Confirmed: ${n} ${n === 1 ? "piece" : "pieces"} still in stock.`);
                load();
                void loadLiveCatalogue(true);
              } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
            }}>{busy ? "Confirming…" : "Everything shown is still in stock"}</Button>
            {oldest && <span className="text-[13px] text-stone">Oldest confirmation: {dateText(oldest)}</span>}
          </div>
        </Card>
        <Card title="At a glance">
          <dl className="space-y-2 text-[14px]">
            <div className="flex justify-between"><dt className="text-stone">Pieces on the site</dt><dd>{pieces ? shown.length - hiddenNow : "…"}</dd></div>
            <div className="flex justify-between"><dt className="text-stone">All pieces, incl. sold and hidden</dt><dd>{pieces?.length ?? "…"}</dd></div>
            <div className="flex justify-between"><dt className="text-stone">New visit requests</dt><dd>{newRequests ? <Link href="/dashboard/requests" className="underline">{newRequests}</Link> : 0}</dd></div>
          </dl>
          <div className="mt-4 flex gap-3">
            <Link href="/dashboard/piece" className="inline-flex h-11 items-center rounded-full bg-terracotta px-5 text-[14px] text-white transition-colors hover:bg-terracotta-deep">+ Add a piece</Link>
            <Link href="/dashboard/pieces" className="inline-flex h-11 items-center rounded-full border border-ink px-5 text-[14px] hover:bg-limestone">All pieces</Link>
          </div>
        </Card>
      </div>
      <ResultsPanel shopId={shop.shopId} pieces={pieces ?? []} />
      <Flash message={flash} />
    </div>
  );
}

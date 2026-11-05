"use client";
// A shop's pieces (or, for an admin, everyone's), with the quick actions a
// jeweller needs at the counter: mark sold or reserved, hide, duplicate, delete.
import Link from "next/link";
import { useMemo, useState } from "react";
import { loadLiveCatalogue } from "@/lib/catalogue-store";
import { aed, dateShort } from "@/lib/format";
import { pieceHref } from "@/lib/links";
import { deletePiece, duplicatePiece, updatePiece, type PieceRow, type PieceStatus } from "@/lib/portal";
import { PieceImage } from "../PieceImage";
import { Button, Empty, Flash, Notice, STATUS_OPTIONS, StatusBadge, input, useFlash } from "./ui";

export function PieceList({ pieces, setPieces, editHref, shopName, shopNames, newHref }: {
  pieces: PieceRow[]; setPieces: (p: PieceRow[]) => void; editHref: (p: PieceRow) => string;
  shopName: (p: PieceRow) => string; shopNames?: boolean; newHref?: string;
}) {
  const [filter, setFilter] = useState<"all" | PieceStatus>("all");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [flash, setFlash] = useFlash();
  const shown = useMemo(() => pieces.filter((p) =>
    (filter === "all" || p.status === filter) &&
    (!text || `${p.name} ${p.code} ${shopNames ? shopName(p) : ""}`.toLowerCase().includes(text.toLowerCase()))), [pieces, filter, text, shopName, shopNames]);

  const replace = (row: PieceRow) => setPieces(pieces.map((p) => (p.id === row.id ? row : p)));
  const act = async (fn: () => Promise<void>, done: string) => {
    setError("");
    try { await fn(); setFlash(done); void loadLiveCatalogue(true); } catch (e) { setError((e as Error).message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-[12rem] flex-1 text-[13px] text-stone">Search<input className={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="Name or reference" /></label>
        <label className="text-[13px] text-stone">Show
          <select className={input} value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
            <option value="all">All ({pieces.length})</option>
            {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label} ({pieces.filter((p) => p.status === s.id).length})</option>)}
          </select>
        </label>
        {newHref && <Link href={newHref} className="inline-flex h-12 items-center bg-ink px-4 text-[14px] text-chalk hover:bg-ink-soft">+ Add a piece</Link>}
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {!shown.length ? (
        <Empty title={pieces.length ? "Nothing matches." : "No pieces yet."}>{!pieces.length && newHref && <Link href={newHref} className="underline">Add your first piece</Link>}</Empty>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {shown.map((p) => (
            <li key={p.id} className="grid grid-cols-[4.5rem_1fr] gap-3 py-3 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center">
              <Link href={editHref(p)} className="block aspect-[4/5] overflow-hidden bg-limestone">
                {p.images[0] && <PieceImage name={p.images[0]} alt="" sizes="72px" className="size-full object-cover" />}
              </Link>
              <div className="min-w-0">
                <Link href={editHref(p)} className="block truncate text-[15px] text-ink hover:underline">{p.name}</Link>
                <p className="text-[12px] text-stone">
                  {p.code}{shopNames && ` · ${shopName(p)}`} · {p.purity ?? "—"} · {p.weight_grams ? `${p.weight_grams} g` : "—"}
                  {" · "}{p.price_mode === "listed" && p.price_aed ? aed(p.price_aed) : p.price_mode === "indicative" ? "From today's rate" : "On request"}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-stone">
                  <StatusBadge status={p.status} /> Stock confirmed {dateShort(p.stock_confirmed_at)}
                  {p.featured_order !== null && <span className="text-brass-deep">· Featured #{p.featured_order}</span>}
                </p>
              </div>
              <div className="col-span-2 flex flex-wrap items-center gap-2 sm:col-span-1 sm:justify-end">
                <select aria-label={`Status of ${p.name}`} value={p.status} className="h-10 border border-line-strong bg-chalk px-2 text-[13px]"
                  onChange={(e) => act(async () => replace(await updatePiece(p.id, { status: e.target.value as PieceStatus })), "Status updated.")}>
                  {STATUS_OPTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <Link href={editHref(p)} className="inline-flex h-10 items-center border border-line-strong px-3 text-[13px] hover:border-ink">Edit</Link>
                {(p.status === "available" || p.status === "reserved_in_store") && (
                  <a href={pieceHref(p.slug)} target="_blank" rel="noopener" className="inline-flex h-10 items-center px-2 text-[13px] text-ink-soft underline decoration-line-strong underline-offset-4">View</a>
                )}
                <Button variant="quiet" onClick={() => act(async () => setPieces([await duplicatePiece(p, shopName(p)), ...pieces]), "Copied. The copy is hidden until you edit it.")}>Duplicate</Button>
                <Button variant="quiet" className="text-[#7d2f25]" onClick={() => {
                  if (!confirm(`Delete “${p.name}”? This can't be undone. To take it off the site for now, choose Hidden instead.`)) return;
                  void act(async () => { await deletePiece(p); setPieces(pieces.filter((x) => x.id !== p.id)); }, "Deleted.");
                }}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Flash message={flash} />
    </div>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Notice } from "@/components/portal/ui";
import { downloadCsv, listApplications, listShops, shopStats } from "@/lib/admin";
import { listPieces, listRequests, type PieceRow, type ShopRow, type VisitRequestRow } from "@/lib/portal";

const COLS: [string, string][] = [
  ["piece_view", "Piece views"], ["shop_view", "Shop views"], ["whatsapp_click", "WhatsApp"], ["call_click", "Calls"],
  ["directions_click", "Directions"], ["visit_request", "Visit requests"],
];

export default function AdminOverview() {
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [pieces, setPieces] = useState<PieceRow[]>([]);
  const [requests, setRequests] = useState<VisitRequestRow[]>([]);
  const [pending, setPending] = useState(0);
  const [stats, setStats] = useState<Map<string, Record<string, number>> | null>(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([listShops(), listPieces(), listRequests(), listApplications()])
      .then(([s, p, r, a]) => { setShops(s); setPieces(p); setRequests(r); setPending(a.filter((x) => x.status === "pending").length); })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => { shopStats(days).then(setStats).catch((e) => setError(e.message)); }, [days]);

  const live = shops.filter((s) => s.is_approved && s.is_active);
  const tiles: [string, number | string, string?][] = [
    ["Jewellers on the site", live.length, "/admin/shops"],
    ["Waiting for approval", shops.filter((s) => !s.is_approved).length, "/admin/shops"],
    ["Applications to review", pending, "/admin/applications"],
    ["Pieces listed", pieces.filter((p) => p.status === "available" || p.status === "reserved_in_store").length, "/admin/pieces"],
    ["New visit requests", requests.filter((r) => r.status === "new").length, "/admin/requests"],
  ];
  return (
    <div className="space-y-5">
      {error && <Notice tone="error">{error}</Notice>}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map(([label, n, href]) => (
          <Link key={label} href={href ?? "#"} className="bg-card p-4 hover:bg-limestone/60">
            <dt className="text-[12px] text-stone">{label}</dt>
            <dd className="mt-1 text-[26px] font-semibold tabular-nums">{n}</dd>
          </Link>
        ))}
      </dl>
      <Card title="Results by jeweller" action={
        <div className="flex items-center gap-3">
          <select aria-label="Period" value={days} onChange={(e) => setDays(Number(e.target.value))} className="h-11 rounded-xl border border-line-strong bg-card px-2.5 text-[16px] md:h-10 md:text-[13px]">
            <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
          </select>
          <Button variant="secondary" className="h-9" disabled={!stats} onClick={() => downloadCsv(`results-last-${days}-days.csv`,
            ["Jeweller", ...COLS.map((c) => c[1]), "Requests: visited"],
            shops.map((s) => { const r = stats?.get(s.id) ?? {}; return [s.name, ...COLS.map(([k]) => r[k] ?? 0), r.requests_visited ?? 0]; }))}>
            Export CSV
          </Button>
        </div>}>
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <table className="w-full min-w-[42rem] text-left text-[14px]">
            <thead className="text-[12px] text-stone"><tr><th className="py-2 font-normal">Jeweller</th>{COLS.map(([, l]) => <th key={l} className="py-2 text-right font-normal">{l}</th>)}<th /></tr></thead>
            <tbody className="divide-y divide-line border-y border-line">
              {shops.map((s) => {
                const r = stats?.get(s.id) ?? {};
                return (
                  <tr key={s.id}>
                    <td className="py-2">{s.name}{s.is_demo && <span className="ml-1.5 text-[12px] text-stone">demo</span>}</td>
                    {COLS.map(([k]) => <td key={k} className="py-2 text-right tabular-nums">{stats ? r[k] ?? 0 : "…"}</td>)}
                    <td className="py-2 pl-3 text-right"><Link href={`/admin/report?shop=${s.id}&days=${days}`} className="text-[13px] underline decoration-line-strong underline-offset-4">Report</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-stone">Demonstration shops aren&apos;t counted. Open a jeweller&apos;s report to print it or save it as a PDF for their monthly update.</p>
      </Card>
    </div>
  );
}

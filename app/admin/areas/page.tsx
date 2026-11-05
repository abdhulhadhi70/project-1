"use client";
// Gold districts. An area appears on the site once a shop is in it.
import { useEffect, useState } from "react";
import { Button, Card, Field, Flash, Notice, input, useFlash } from "@/components/portal/ui";
import { EMIRATES } from "@/data/catalogue";
import { deleteArea, listAreas, saveArea, type AreaRow } from "@/lib/admin";
import { loadLiveCatalogue } from "@/lib/catalogue-store";
import { slug } from "@/lib/catalogue-query";

const ALL_EMIRATES = [...EMIRATES, "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"] as const;
const empty: AreaRow = { slug: "", name: "", emirate: "Dubai", note: "", lat: 25.2, lng: 55.3, sort_order: 99 };

export default function Areas() {
  const [areas, setAreas] = useState<AreaRow[] | null>(null);
  const [edit, setEdit] = useState<AreaRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");
  const [flash, setFlash] = useFlash();
  const load = () => listAreas().then(setAreas).catch((e) => setError(e.message));
  useEffect(() => { void load(); }, []);
  if (!areas) return error ? <Notice tone="error">{error}</Notice> : <p className="text-[14px] text-stone">Loading…</p>;
  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <Card title="Areas" action={<Button variant="secondary" className="h-9" onClick={() => { setEdit({ ...empty }); setIsNew(true); }}>+ New area</Button>}>
        <ul className="divide-y divide-line border-y border-line text-[14px]">
          {areas.map((a) => (
            <li key={a.slug} className="flex items-center justify-between gap-3 py-2">
              <span>{a.name} <span className="text-[12px] text-stone">· {a.emirate}</span></span>
              <Button variant="quiet" onClick={() => { setEdit({ ...a }); setIsNew(false); }}>Edit</Button>
            </li>
          ))}
        </ul>
      </Card>
      {edit && (
        <Card title={isNew ? "New area" : edit.name}>
          <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            try {
              await saveArea({ ...edit, slug: isNew ? slug(edit.name) : edit.slug }, isNew);
              setFlash("Saved."); setEdit(null); void load(); void loadLiveCatalogue(true);
            } catch (err) { setError((err as Error).message); }
          }}>
            <Field label="Name"><input className={input} required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <Field label="Emirate">
              <select className={input} value={edit.emirate} onChange={(e) => setEdit({ ...edit, emirate: e.target.value as AreaRow["emirate"] })}>
                {ALL_EMIRATES.map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field label="One line about it"><input className={input} maxLength={300} value={edit.note} onChange={(e) => setEdit({ ...edit, note: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Latitude"><input className={input} inputMode="decimal" value={edit.lat} onChange={(e) => setEdit({ ...edit, lat: Number(e.target.value) })} /></Field>
              <Field label="Longitude"><input className={input} inputMode="decimal" value={edit.lng} onChange={(e) => setEdit({ ...edit, lng: Number(e.target.value) })} /></Field>
              <Field label="Order"><input className={input} inputMode="numeric" value={edit.sort_order} onChange={(e) => setEdit({ ...edit, sort_order: Number(e.target.value) || 0 })} /></Field>
            </div>
            {error && <Notice tone="error">{error}</Notice>}
            <div className="flex gap-3">
              <Button type="submit">Save</Button>
              <Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button>
              {!isNew && <Button variant="danger" onClick={async () => {
                if (!confirm(`Delete ${edit.name}?`)) return;
                try { await deleteArea(edit.slug); setEdit(null); void load(); } catch (err) { setError((err as Error).message); }
              }}>Delete</Button>}
            </div>
          </form>
        </Card>
      )}
      <Flash message={flash} />
    </div>
  );
}

"use client";
// Who can manage a shop. Owners add staff by email; admins can add owners.
import { useCallback, useEffect, useState } from "react";
import { dateText } from "@/lib/format";
import { addMember, cancelInvite, removeMember, team, type Invite, type TeamMember } from "@/lib/portal";
import { Button, Card, Field, Flash, Notice, input, useFlash } from "./ui";

export function TeamPanel({ shopId, canManage, canAddOwner = false, me }: { shopId: string; canManage: boolean; canAddOwner?: boolean; me: string }) {
  const [data, setData] = useState<{ members: TeamMember[]; invites: Invite[] } | null>(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "owner">("staff");
  const [error, setError] = useState("");
  const [flash, setFlash] = useFlash();
  const load = useCallback(() => team(shopId).then(setData).catch((e) => setError(e.message)), [shopId]);
  useEffect(() => { void load(); }, [load]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
      <Card title="People who can manage this shop">
        {error && <div className="mb-3"><Notice tone="error">{error}</Notice></div>}
        {!data ? <p className="text-[14px] text-stone">Loading…</p> : (
          <ul className="divide-y divide-line border-y border-line text-[14px]">
            {data.members.map((m) => (
              <li key={m.user_id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate">{m.full_name ? `${m.full_name} · ` : ""}{m.email}{m.email === me && " (you)"}</span>
                  <span className="text-[12px] text-stone">{m.role === "owner" ? "Owner" : "Staff"} · since {dateText(m.joined_at)}</span>
                </span>
                {canManage && (m.role === "staff" || canAddOwner) && m.email !== me && (
                  <Button variant="quiet" className="text-[#7d2f25]" onClick={async () => {
                    if (!confirm(`Remove ${m.email} from this shop?`)) return;
                    try { await removeMember(shopId, m.user_id); setFlash("Removed."); void load(); } catch (e) { setError((e as Error).message); }
                  }}>Remove</Button>
                )}
              </li>
            ))}
            {data.invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate">{i.email}</span>
                  <span className="text-[12px] text-stone">{i.role === "owner" ? "Owner" : "Staff"} · invited {dateText(i.created_at)}, not joined yet</span>
                </span>
                {canManage && (
                  <Button variant="quiet" onClick={async () => {
                    try { await cancelInvite(i.id); setFlash("Invitation cancelled."); void load(); } catch (e) { setError((e as Error).message); }
                  }}>Cancel</Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
      {canManage ? (
        <Card title={canAddOwner ? "Add a person" : "Add staff"}>
          <form className="space-y-3" onSubmit={async (e) => {
            e.preventDefault();
            setError("");
            try {
              const r = await addMember(shopId, email, role);
              setFlash(r === "added" ? `${email} can now manage this shop.` : `Invitation saved for ${email}.`);
              setEmail("");
              void load();
            } catch (err) { setError((err as Error).message); }
          }}>
            <Field label="Their email"><input className={input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            {canAddOwner && (
              <Field label="Role">
                <select className={input} value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
                  <option value="staff">Staff</option><option value="owner">Owner</option>
                </select>
              </Field>
            )}
            <Button type="submit" className="w-full">Add</Button>
            <p className="text-[12px] leading-snug text-stone">
              If they already have an account, they get access at once. If not, they create one at <strong>/join</strong> with this email; access starts when they confirm it.
            </p>
          </form>
        </Card>
      ) : (
        <Card title="Adding people"><p className="text-[14px] text-ink-soft">Only the shop&apos;s owner can add or remove staff.</p></Card>
      )}
      <Flash message={flash} />
    </div>
  );
}

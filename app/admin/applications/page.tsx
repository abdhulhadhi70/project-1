"use client";
// "List your shop" applications. Approving one creates the jeweller,
// unapproved, with the details filled in, and invites the applicant as owner.
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Empty, Notice } from "@/components/portal/ui";
import { createShop, listApplications, reviewApplication, type Application } from "@/lib/admin";
import { getCatalogue } from "@/lib/catalogue-store";
import { slug } from "@/lib/catalogue-query";
import { dateText } from "@/lib/format";
import { addMember } from "@/lib/portal";

export default function Applications() {
  const router = useRouter();
  const [apps, setApps] = useState<Application[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { listApplications().then(setApps).catch((e) => setError(e.message)); }, []);
  if (error) return <Notice tone="error">{error}</Notice>;
  if (!apps) return <p className="text-[14px] text-stone">Loading…</p>;
  if (!apps.length) return <Empty title="No applications yet.">They arrive from the “List your shop” form on the For jewellers page.</Empty>;

  async function approve(a: Application) {
    setError("");
    try {
      const areas = getCatalogue().areas;
      const area = areas.find((x) => a.area && x.name.toLowerCase().includes(a.area.toLowerCase())) ?? areas.find((x) => x.emirate === a.emirate) ?? areas[0];
      const shop = await createShop({
        name: a.shop_name, slug: `${slug(a.shop_name)}-${Math.random().toString(36).slice(2, 6)}`, area: area.slug,
        lat: area.lat, lng: area.lng, phone: a.phone, is_approved: false, is_active: true, is_demo: false, languages: [],
      });
      await addMember(shop.id, a.email, "owner");
      await reviewApplication(a.id, "approved", shop.id);
      router.push(`/admin/shop?id=${shop.id}`);
    } catch (e) { setError((e as Error).message); }
  }

  return (
    <ul className="divide-y divide-line border-y border-line">
      {apps.map((a) => (
        <li key={a.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <p className="text-[15px] text-ink">{a.shop_name} <span className="text-[12px] text-stone">· {a.status}</span></p>
            <p className="text-[13px] text-stone">{a.contact_name} · <a className="underline" href={`mailto:${a.email}`}>{a.email}</a> · <a className="underline" href={`tel:${a.phone}`}>{a.phone}</a> · {a.area ? `${a.area}, ` : ""}{a.emirate} · {dateText(a.created_at)}</p>
            {a.message && <p className="mt-1 text-[13px] text-ink-soft">“{a.message}”</p>}
          </div>
          {a.status === "pending" && (
            <div className="flex gap-2">
              <Button onClick={() => approve(a)}>Create jeweller</Button>
              <Button variant="secondary" onClick={async () => { try { const r = await reviewApplication(a.id, "rejected"); setApps(apps.map((x) => (x.id === a.id ? r : x))); } catch (e) { setError((e as Error).message); } }}>Decline</Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

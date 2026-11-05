"use client";
// "List your shop": saved as an application for our team to review in the
// admin portal. Nothing goes live until an admin approves it.
import Link from "next/link";
import { useState } from "react";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";

const field = "mt-1.5 h-11 w-full border border-line-strong bg-chalk px-3 text-[15px] text-ink outline-none focus:border-ink";
const EMIRATES = ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

export function InterestForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!supabaseConfigured) return <p>Registration isn&apos;t open in this build yet.</p>;
  if (sent) {
    return (
      <div className="border-l-2 border-ink bg-limestone/60 px-4 py-3 text-[15px] text-ink">
        Thank you. Our team will contact you within two working days to set up your shop. Already have an account? <Link href="/login">Sign in</Link>.
      </div>
    );
  }
  return (
    <form className="space-y-4" onSubmit={async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      const v = (k: string) => String(f.get(k) ?? "").trim();
      if (!/^\+?[0-9 ]{7,20}$/.test(v("phone"))) return setError("Phone: digits and spaces only, e.g. 050 123 4567.");
      setBusy(true); setError("");
      const { error } = await getSupabase().rpc("apply_for_listing", {
        p_shop_name: v("business"), p_contact: v("name"), p_email: v("email"), p_phone: v("phone"),
        p_emirate: v("emirate"), p_area: v("area") || null, p_message: v("message") || null,
      });
      setBusy(false);
      if (error) setError(error.message.includes("already in") ? "We already have an application from this email today. We'll be in touch." : "That didn't go through. Please check the details and try again.");
      else setSent(true);
    }}>
      {error && <p role="alert" className="border-l-2 border-[#9a3b2f] bg-limestone/60 px-3 py-2 text-[14px] text-[#7d2f25]">{error}</p>}
      <label className="block text-[13px] text-stone">Shop name<input name="business" required maxLength={120} className={field} /></label>
      <label className="block text-[13px] text-stone">Your name<input name="name" required maxLength={100} autoComplete="name" className={field} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[13px] text-stone">Email<input name="email" type="email" required autoComplete="email" className={field} /></label>
        <label className="block text-[13px] text-stone">Phone<input name="phone" type="tel" required autoComplete="tel" className={field} /></label>
        <label className="block text-[13px] text-stone">Emirate
          <select name="emirate" required className={field} defaultValue="">
            <option value="" disabled>Choose</option>
            {EMIRATES.map((e) => <option key={e}>{e}</option>)}
          </select>
        </label>
        <label className="block text-[13px] text-stone">Area (optional)<input name="area" maxLength={80} placeholder="e.g. Deira Gold Souk" className={field} /></label>
      </div>
      <label className="block text-[13px] text-stone">Anything we should know (optional)
        <textarea name="message" rows={4} maxLength={1000} className={`${field} h-auto py-2`} />
      </label>
      <button type="submit" disabled={busy} className="h-12 bg-ink px-6 text-[14px] font-medium text-chalk hover:bg-ink-soft disabled:opacity-60">{busy ? "Sending…" : "Send"}</button>
      <p className="text-[12px] text-stone">We use these details only to contact you about listing your shop.</p>
    </form>
  );
}

"use client";
// Composes an email in the visitor's own mail app. There is no backend, so
// nothing is stored here; the page shows this form only when a real inbox is
// set in data/site.ts.
import { useState } from "react";
import { site } from "@/data/site";

const field = "mt-1.5 h-11 w-full border border-line-strong bg-chalk px-3 text-[15px] text-ink outline-none focus:border-ink";

export function InterestForm() {
  const [sent, setSent] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const body = [
          `Business: ${f.get("business")}`,
          `Contact: ${f.get("name")}`,
          `Emirate: ${f.get("emirate")}`,
          `Phone: ${f.get("phone")}`,
          "",
          String(f.get("message") ?? ""),
        ].join("\n");
        window.location.href = `mailto:${site.contactEmail}?subject=${encodeURIComponent(`Listing interest: ${f.get("business")}`)}&body=${encodeURIComponent(body)}`;
        setSent(true);
      }}
    >
      <label className="block text-[13px] text-stone">Business name<input name="business" required className={field} /></label>
      <label className="block text-[13px] text-stone">Your name<input name="name" required className={field} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[13px] text-stone">Emirate
          <select name="emirate" required className={field} defaultValue="">
            <option value="" disabled>Choose</option>
            {["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"].map((e) => <option key={e}>{e}</option>)}
          </select>
        </label>
        <label className="block text-[13px] text-stone">Phone<input name="phone" type="tel" required className={field} /></label>
      </div>
      <label className="block text-[13px] text-stone">Anything we should know (optional)
        <textarea name="message" rows={4} className={`${field} h-auto py-2`} />
      </label>
      <button type="submit" className="h-12 bg-ink px-6 text-[14px] font-medium text-chalk hover:bg-ink-soft">Write the email</button>
      {sent && <p className="text-[13px] text-stone">Your mail app should have opened with the details filled in. Send it from there.</p>}
    </form>
  );
}

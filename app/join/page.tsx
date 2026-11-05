"use client";
import Link from "next/link";
import { useState } from "react";
import { AuthShell, NotConnected, Notice, button, field } from "@/components/auth/AuthShell";
import { authMessage, getSupabase, supabaseConfigured } from "@/lib/supabase";

// For people a shop (or our team) has invited by email. Signing up alone
// joins nothing: the account is linked to the shop once the email that was
// invited is confirmed.
export default function JoinPage() {
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthShell title="Create your account"
      intro="Use the email address your shop or our team invited. Once you confirm it, you'll see your shop when you sign in."
      foot={<>Already have an account? <Link href="/login" className="text-ink underline decoration-line-strong underline-offset-4">Sign in</Link></>}>
      {!supabaseConfigured ? <NotConnected /> : sentTo ? (
        <Notice tone="ok">Nearly done. We sent a confirmation link to {sentTo}. Open it on this device, then sign in.</Notice>
      ) : (
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const email = String(f.get("email")).trim();
          setBusy(true); setError("");
          const { error } = await getSupabase().auth.signUp({
            email, password: String(f.get("password")),
            options: { data: { full_name: String(f.get("name")).trim() }, emailRedirectTo: `${window.location.origin}/login` },
          });
          setBusy(false);
          if (error) setError(authMessage(error)); else setSentTo(email);
        }}>
          {error && <Notice tone="error">{error}</Notice>}
          <label className="block text-[13px] text-stone">Your name<input name="name" required maxLength={100} autoComplete="name" className={field} /></label>
          <label className="block text-[13px] text-stone">Email (the one that was invited)<input name="email" type="email" required autoComplete="email" className={field} /></label>
          <label className="block text-[13px] text-stone">Password<input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} /></label>
          <p className="text-[12px] text-stone">At least 8 characters.</p>
          <button type="submit" disabled={busy} className={button}>{busy ? "Creating…" : "Create account"}</button>
        </form>
      )}
    </AuthShell>
  );
}

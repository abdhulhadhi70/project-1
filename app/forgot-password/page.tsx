"use client";
import Link from "next/link";
import { useState } from "react";
import { AuthShell, NotConnected, Notice, button, field } from "@/components/auth/AuthShell";
import { authMessage, getSupabase, supabaseConfigured } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthShell title="Reset your password" intro="Enter the email you sign in with. We'll send a link to choose a new password."
      foot={<Link href="/login" className="underline decoration-line-strong underline-offset-4">Back to sign in</Link>}>
      {!supabaseConfigured ? <NotConnected /> : sentTo ? (
        // Same message whether or not the email has an account, so the page
        // cannot be used to find out who is registered.
        <Notice tone="ok">If {sentTo} has an account, a reset link is on its way. It works once and expires after an hour.</Notice>
      ) : (
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const email = String(new FormData(e.currentTarget).get("email")).trim();
          setBusy(true); setError("");
          const { error } = await getSupabase().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
          setBusy(false);
          if (error && !/user not found/i.test(error.message)) setError(authMessage(error)); else setSentTo(email);
        }}>
          {error && <Notice tone="error">{error}</Notice>}
          <label className="block text-[13px] text-stone">Email<input name="email" type="email" required autoComplete="email" className={field} /></label>
          <button type="submit" disabled={busy} className={button}>{busy ? "Sending…" : "Send reset link"}</button>
        </form>
      )}
    </AuthShell>
  );
}

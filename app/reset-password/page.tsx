"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell, NotConnected, Notice, button, field } from "@/components/auth/AuthShell";
import { authMessage, getSupabase, supabaseConfigured } from "@/lib/supabase";

// Reached from the emailed link. Supabase reads the one-time token from the
// address and signs the person in for this one purpose.
export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<"waiting" | "yes" | "no">("waiting");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!supabaseConfigured) return;
    const sb = getSupabase();
    const { data } = sb.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady("yes");
    });
    sb.auth.getSession().then(({ data: d }) => setReady((r) => (d.session ? "yes" : r)));
    const t = setTimeout(() => setReady((r) => (r === "waiting" ? "no" : r)), 4000);
    return () => { data.subscription.unsubscribe(); clearTimeout(t); };
  }, []);

  return (
    <AuthShell title="Choose a new password" foot={<Link href="/login" className="underline decoration-line-strong underline-offset-4">Back to sign in</Link>}>
      {!supabaseConfigured ? <NotConnected /> : ready === "no" ? (
        <Notice tone="error">This link has expired or was already used. <Link href="/forgot-password" className="underline">Ask for a new one</Link>.</Notice>
      ) : ready === "waiting" ? (
        <Notice>Checking your link…</Notice>
      ) : (
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const a = String(f.get("password")), b = String(f.get("confirm"));
          if (a !== b) return setError("The two passwords don't match.");
          setBusy(true); setError("");
          const { error } = await getSupabase().auth.updateUser({ password: a });
          setBusy(false);
          if (error) setError(authMessage(error)); else router.replace("/account?password=updated");
        }}>
          {error && <Notice tone="error">{error}</Notice>}
          <label className="block text-[13px] text-stone">New password<input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} /></label>
          <label className="block text-[13px] text-stone">Type it again<input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} /></label>
          <button type="submit" disabled={busy} className={button}>{busy ? "Saving…" : "Save password"}</button>
        </form>
      )}
    </AuthShell>
  );
}

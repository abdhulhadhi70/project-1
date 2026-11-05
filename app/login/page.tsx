"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell, NotConnected, Notice, button, field } from "@/components/auth/AuthShell";
import { authMessage, getSupabase, supabaseConfigured } from "@/lib/supabase";
import { useAccount } from "@/lib/use-account";

export default function LoginPage() {
  const router = useRouter();
  const account = useAccount();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (account.state === "signed_in") router.replace("/account"); }, [account.state, router]);

  return (
    <AuthShell title="Sign in" intro="Manage your shop, your pieces and your customers' visit requests."
      foot={<>New jeweller? <Link href="/for-jewellers" className="text-ink underline decoration-line-strong underline-offset-4">Register your interest</Link>. Invited by your shop? <Link href="/join" className="text-ink underline decoration-line-strong underline-offset-4">Create your account</Link>.</>}>
      {!supabaseConfigured ? <NotConnected /> : (
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true); setError("");
          const { error } = await getSupabase().auth.signInWithPassword({ email: String(f.get("email")).trim(), password: String(f.get("password")) });
          setBusy(false);
          if (error) setError(authMessage(error)); else router.replace("/account");
        }}>
          {error && <Notice tone="error">{error}</Notice>}
          <label className="block text-[13px] text-stone">Email<input name="email" type="email" required autoComplete="email" className={field} /></label>
          <label className="block text-[13px] text-stone">Password<input name="password" type="password" required autoComplete="current-password" className={field} /></label>
          <button type="submit" disabled={busy} className={button}>{busy ? "Signing in…" : "Sign in"}</button>
          <p className="text-[14px]"><Link href="/forgot-password" className="text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink">Forgot your password?</Link></p>
        </form>
      )}
    </AuthShell>
  );
}

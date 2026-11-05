"use client";
// One Supabase client for the browser. The site is static, so logins happen
// here and the database's access rules decide what each person may touch.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured) throw new Error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  client ??= createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

/** Supabase's error messages, in plain words. */
export function authMessage(err: { message?: string; code?: string } | null | undefined): string {
  const m = (err?.message ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "That email and password don't match. Check both, or reset your password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first: open the link we sent you, then sign in.";
  if (m.includes("already registered") || m.includes("already been registered")) return "There is already an account with this email. Sign in instead, or reset the password.";
  if (m.includes("password should be") || m.includes("weak")) return "Choose a longer password: at least 8 characters.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a minute and try again.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Can't reach the server. Check your connection and try again.";
  return err?.message || "Something went wrong. Please try again.";
}

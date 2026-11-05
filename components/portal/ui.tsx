"use client";
// Small building blocks shared by the jeweller and admin portals. Large
// tap targets and plain labels: most jewellers will use these on a phone.
import { useEffect, useState } from "react";

export const input = "mt-1.5 h-12 w-full border border-line-strong bg-chalk px-3 text-[15px] text-ink outline-none focus:border-ink disabled:bg-limestone disabled:text-stone";

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block text-[13px] text-stone ${className}`}>
      {label}
      {children}
      {hint && <span className="mt-1 block text-[12px] text-stone">{hint}</span>}
    </label>
  );
}

export function Button({ variant = "primary", className = "", ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "quiet" }) {
  const v = {
    primary: "bg-ink text-chalk hover:bg-ink-soft",
    secondary: "border border-ink text-ink hover:bg-limestone",
    danger: "border border-[#9a3b2f] text-[#7d2f25] hover:bg-[#9a3b2f] hover:text-chalk",
    quiet: "text-ink-soft underline decoration-line-strong underline-offset-4 hover:text-ink",
  }[variant];
  const size = variant === "quiet" ? "h-10 px-1" : "h-11 px-4";
  return <button type="button" {...rest} className={`inline-flex items-center justify-center gap-2 text-[14px] disabled:opacity-50 ${size} ${v} ${className}`} />;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "ok" | "warn"; children: React.ReactNode }) {
  const c = { error: "border-[#9a3b2f] text-[#7d2f25]", ok: "border-ink text-ink", warn: "border-brass text-ink", info: "border-line-strong text-ink-soft" }[tone];
  return <div role={tone === "error" ? "alert" : "status"} className={`border-l-2 bg-limestone/60 px-3 py-2.5 text-[14px] ${c}`}>{children}</div>;
}

export function Card({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`border border-line bg-chalk p-4 md:p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          {title && <h2 className="text-[15px] font-medium">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Toggle({ checked, onChange, label, hint, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string; disabled?: boolean }) {
  return (
    <label className={`flex items-start justify-between gap-4 py-2 ${disabled ? "opacity-50" : "cursor-pointer"}`}>
      <span>
        <span className="block text-[14px] text-ink">{label}</span>
        {hint && <span className="block text-[12px] text-stone">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)}
        className="relative mt-0.5 h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full bg-line-strong transition-colors checked:bg-ink before:absolute before:left-0.5 before:top-0.5 before:size-5 before:rounded-full before:bg-chalk before:transition-transform checked:before:translate-x-5" />
    </label>
  );
}

export function Chips<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T[]; onChange: (v: T[]) => void }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button key={o.id} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o.id) : [...value, o.id])}
            className={`h-10 border px-3 text-[13px] ${on ? "border-ink bg-ink text-chalk" : "border-line-strong text-ink hover:border-ink"}`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const STATUS = {
  available: { label: "Available", c: "bg-[#e6eee6] text-[#2f5130]" },
  reserved_in_store: { label: "Reserved", c: "bg-[#f3ead8] text-[#6b4f1d]" },
  sold: { label: "Sold", c: "bg-limestone text-stone" },
  hidden: { label: "Hidden", c: "bg-limestone text-stone" },
} as const;
export type PieceStatus = keyof typeof STATUS;
export const STATUS_OPTIONS = (Object.keys(STATUS) as PieceStatus[]).map((id) => ({ id, label: STATUS[id].label }));

export function StatusBadge({ status }: { status: PieceStatus }) {
  const s = STATUS[status];
  return <span className={`inline-block px-2 py-0.5 text-[12px] ${s.c}`}>{s.label}</span>;
}

/** A short-lived message after saving. */
export function useFlash(): [string, (m: string) => void] {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 4000);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg, setMsg];
}

export function Flash({ message }: { message: string }) {
  if (!message) return null;
  return <p role="status" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-sm bg-ink px-4 py-3 text-center text-[14px] text-chalk shadow-lg md:bottom-6">{message}</p>;
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line-strong px-4 py-12 text-center">
      <p className="font-serif text-[24px] leading-tight">{title}</p>
      {children && <div className="mt-3 text-[14px] text-stone">{children}</div>}
    </div>
  );
}

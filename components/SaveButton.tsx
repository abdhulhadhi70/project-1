"use client";
import { useSaved } from "@/lib/saved";
import { HeartIcon } from "./Icons";

export function SaveButton({ slug, name, variant = "overlay" }: { slug: string; name: string; variant?: "overlay" | "inline" }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(slug);
  const label = saved ? `Remove ${name} from saved` : `Save ${name}`;
  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggle(slug)}
        aria-pressed={saved}
        className="inline-flex h-11 items-center gap-2 text-[14px] text-ink hover:text-ink-soft"
      >
        <HeartIcon filled={saved} className={`size-5 ${saved ? "text-brass-deep" : ""}`} />
        {saved ? "Saved" : "Save"}
        <span className="sr-only">{name}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center text-ink/80 transition-colors hover:text-ink"
    >
      <span className="grid size-8 place-items-center rounded-full bg-chalk/85">
        <HeartIcon filled={saved} className={`size-[17px] ${saved ? "text-brass-deep" : ""}`} />
      </span>
    </button>
  );
}

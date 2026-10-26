"use client";
import Link from "next/link";
import { useSaved } from "@/lib/saved";
import { HeartIcon } from "./Icons";

export function SavedLink() {
  const { saved } = useSaved();
  return (
    <Link href="/saved" className="relative inline-flex h-10 items-center gap-2 text-[14px] text-ink hover:text-ink-soft">
      <HeartIcon className="size-[19px]" />
      <span>Saved</span>
      {saved.length > 0 && (
        <span className="min-w-5 rounded-full bg-ink px-1.5 text-center text-[11px] leading-5 text-chalk" aria-label={`${saved.length} saved`}>
          {saved.length}
        </span>
      )}
    </Link>
  );
}

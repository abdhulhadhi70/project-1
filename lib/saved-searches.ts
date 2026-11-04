"use client";
// Saved searches, like Property Finder's, kept in this browser only. Alerts
// for new matches need accounts, so they arrive with the backend.
import { useCallback, useSyncExternalStore } from "react";

export type SavedSearch = { href: string; title: string; savedAt: string };

const KEY = "tibr:searches";
const EVENT = "tibr:searches-change";
const EMPTY: SavedSearch[] = [];
let cacheRaw: string | null = null;
let cacheValue: SavedSearch[] = EMPTY;

function read(): SavedSearch[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cacheRaw) return cacheValue;
  cacheRaw = raw;
  try {
    const v = raw ? JSON.parse(raw) : [];
    cacheValue = Array.isArray(v) ? v.filter((x) => x && typeof x.href === "string" && typeof x.title === "string") : EMPTY;
  } catch {
    cacheValue = EMPTY;
  }
  return cacheValue;
}

function write(next: SavedSearch[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cacheRaw = JSON.stringify(next);
    cacheValue = next;
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedSearches() {
  const searches = useSyncExternalStore(subscribe, read, () => EMPTY);
  const isSaved = (href: string) => searches.some((s) => s.href === href);
  const toggle = useCallback((href: string, title: string) => {
    const cur = read();
    write(cur.some((s) => s.href === href)
      ? cur.filter((s) => s.href !== href)
      : [{ href, title, savedAt: new Date().toISOString() }, ...cur].slice(0, 30));
  }, []);
  const remove = useCallback((href: string) => write(read().filter((s) => s.href !== href)), []);
  return { searches, isSaved, toggle, remove };
}

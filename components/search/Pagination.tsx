import { ChevronLeftIcon, ChevronRightIcon } from "../Icons";

/** Numbered pages with first, last and the neighbours of the current one. */
export function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  const nums = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const btn = "grid h-10 min-w-10 place-items-center border px-2 text-[14px]";
  return (
    <nav aria-label="Pages" className="flex items-center justify-center gap-1.5">
      <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} className={`${btn} border-line-strong disabled:opacity-40`} aria-label="Previous page">
        <ChevronLeftIcon />
      </button>
      {nums.map((n, i) => (
        <span key={n} className="contents">
          {i > 0 && n - nums[i - 1] > 1 && <span className="px-1 text-stone">…</span>}
          <button type="button" onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined}
            className={`${btn} ${n === page ? "border-ink bg-ink text-chalk" : "border-line-strong hover:border-ink"}`}>
            {n}
          </button>
        </span>
      ))}
      <button type="button" disabled={page === pages} onClick={() => onPage(page + 1)} className={`${btn} border-line-strong disabled:opacity-40`} aria-label="Next page">
        <ChevronRightIcon />
      </button>
    </nav>
  );
}

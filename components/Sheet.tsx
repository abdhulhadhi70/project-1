"use client";
// One dialog for the whole site: a bottom sheet on a phone, a centred panel
// on a wider screen. Native <dialog> gives focus trapping and Escape for free.
import { forwardRef, useImperativeHandle, useRef } from "react";
import { CloseIcon } from "./Icons";

export type SheetHandle = { open: () => void; close: () => void };

type Props = {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
  /** Phone only: fill the screen instead of rising from the bottom. */
  full?: boolean;
  onClose?: () => void;
};

export const Sheet = forwardRef<SheetHandle, Props>(function Sheet({ title, kicker, children, footer, wide, full, onClose }, ref) {
  const d = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => ({ open: () => d.current?.showModal(), close: () => d.current?.close() }), []);
  return (
    <dialog
      ref={d}
      aria-label={title}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && d.current?.close()}
      className={`m-0 mt-auto w-full max-w-none overflow-hidden bg-chalk p-0 text-ink open:flex open:flex-col md:m-auto md:max-h-[85dvh] md:border md:border-line ${
        full ? "h-dvh max-h-none md:h-auto" : "max-h-[88dvh]"
      } ${wide ? "md:max-w-2xl" : "md:max-w-md"}`}
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-4 py-3 md:px-5">
        <div>
          {kicker && <p className="text-[12px] text-stone">{kicker}</p>}
          <h2 className="text-[16px] font-medium">{title}</h2>
        </div>
        <button type="button" onClick={() => d.current?.close()} className="-mr-2 grid size-10 place-items-center" aria-label="Close">
          <CloseIcon />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5">{children}</div>
      {footer && <div className="shrink-0 border-t border-line px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-5">{footer}</div>}
    </dialog>
  );
});

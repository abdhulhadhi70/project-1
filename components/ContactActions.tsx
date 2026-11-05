"use client";
// WhatsApp and call links. A real listing opens WhatsApp or the dialler.
// A demonstration listing has no real number, so instead of dialling a
// stranger it shows what would happen, including the prepared message.
import { useId, useRef, useState } from "react";
import type { Shop } from "@/data/catalogue";
import { track } from "@/lib/track";
import { ChatIcon, CloseIcon, PhoneIcon } from "./Icons";

type Props = {
  shop: Shop;
  /** e.g. "22K Rope Chain (ref SA-0142)"; omitted on a shop page. */
  subject?: string;
  /** Page the message links to; defaults to the current page. */
  path?: string;
  /** Counted against this piece in the shop's results. */
  pieceId?: string;
  /** Fires before the shop is contacted. */
  onContact?: (kind: "whatsapp" | "call") => void;
  layout?: "stack" | "column" | "bar" | "card";
};

function message(shop: Shop, subject: string | undefined, url: string) {
  return subject
    ? `Hello ${shop.name}, I saw your ${subject} on Tibr: ${url}\nIs it still available? I would like to come and see it.`
    : `Hello ${shop.name}, I found your shop on Tibr: ${url}\nI would like to visit. When is a good time?`;
}

export function ContactActions({ shop, subject, path, pieceId, onContact, layout = "stack" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<"whatsapp" | "call">("whatsapp");
  const [text, setText] = useState("");
  const titleId = useId();

  const open = (m: "whatsapp" | "call") => {
    onContact?.(m);
    if (!shop.demo) track(m === "whatsapp" ? "whatsapp_click" : "call_click", shop.id, pieceId);
    const url = path ? `${window.location.origin}${path}` : window.location.href.split("#")[0];
    const body = message(shop, subject, url);
    if (m === "whatsapp" && shop.whatsapp) {
      window.open(`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
      return;
    }
    if (m === "call" && shop.phone) {
      window.location.href = `tel:${shop.phone.replace(/\s+/g, "")}`;
      return;
    }
    setMode(m);
    setText(body);
    dialog.current?.showModal();
  };

  const primary = "inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-[14px] font-medium text-chalk transition-colors hover:bg-ink-soft";
  const secondary = "inline-flex h-12 items-center justify-center gap-2 border border-ink px-5 text-[14px] text-ink transition-colors hover:bg-limestone";

  return (
    <>
      {layout === "card" ? (
        <div className="flex gap-2">
          <button type="button" onClick={() => open("call")} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 border border-line-strong px-3 text-[13px] text-ink hover:border-ink">
            <PhoneIcon className="size-4" /> Call
          </button>
          <button type="button" onClick={() => open("whatsapp")} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 border border-line-strong px-3 text-[13px] text-ink hover:border-ink">
            <ChatIcon className="size-4" /> WhatsApp
          </button>
        </div>
      ) : (
        <div className={layout === "bar" ? "grid grid-cols-[1.4fr_1fr] gap-2" : layout === "column" ? "grid gap-2.5" : "grid gap-2.5 sm:grid-cols-2"}>
          <button type="button" onClick={() => open("whatsapp")} className={primary}>
            <ChatIcon /> WhatsApp jeweller
          </button>
          <button type="button" onClick={() => open("call")} className={secondary}>
            <PhoneIcon /> Call shop
          </button>
        </div>
      )}

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-0 mt-auto w-full max-w-none bg-chalk p-0 text-ink md:m-auto md:max-w-md"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="text-[12px] text-stone">Demonstration listing</p>
            <h2 id={titleId} className="mt-0.5 text-[16px] font-medium">
              {mode === "whatsapp" ? `WhatsApp ${shop.name}` : `Call ${shop.name}`}
            </h2>
          </div>
          <button type="button" onClick={() => dialog.current?.close()} className="-mr-2 -mt-1 grid size-11 place-items-center" aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="space-y-4 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-[14px] text-ink-soft">
          <p>
            {shop.name} is an invented jeweller, so there is no real number to {mode === "whatsapp" ? "message" : "call"}.
            {mode === "whatsapp"
              ? " With a real jeweller, this button opens WhatsApp with this message ready to send:"
              : " With a real jeweller, this button opens your phone's dialler with the shop's number."}
          </p>
          {mode === "whatsapp" && (
            <blockquote className="whitespace-pre-line border-l-2 border-brass bg-limestone px-4 py-3 text-[13px] text-ink">
              {text}
            </blockquote>
          )}
          <button type="button" onClick={() => dialog.current?.close()} className="h-11 w-full border border-ink text-ink">
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}

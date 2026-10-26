import Link from "next/link";
import { shopFor, type Piece } from "@/data/catalogue";
import { PieceImage } from "./PieceImage";
import { Price } from "./Price";
import { SaveButton } from "./SaveButton";

export function PieceCard({ piece, priority = false }: { piece: Piece; priority?: boolean }) {
  const shop = shopFor(piece);
  return (
    <article className="group relative">
      <Link href={`/pieces/${piece.slug}`} className="block focus-visible:outline-offset-4">
        <div className="relative aspect-[4/5] overflow-hidden bg-limestone">
          <PieceImage
            name={piece.images[0]}
            alt={piece.name}
            sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
            priority={priority}
            className="size-full object-cover transition-transform duration-700 ease-quiet md:group-hover:scale-[1.035]"
          />
        </div>
        <h3 className="mt-3 text-[14px] leading-snug text-ink md:mt-3.5 md:text-[15px]">{piece.name}</h3>
        <Price price={piece.price} className="mt-1 text-[14px] md:text-[15px]" />
        <p className="mt-1 truncate text-[12px] text-stone md:text-[13px]">
          {shop.name} · {shop.area}
        </p>
      </Link>
      <div className="absolute right-0 top-0 z-10 md:right-1 md:top-1">
        <SaveButton slug={piece.slug} name={piece.name} />
      </div>
    </article>
  );
}

export function PieceGrid({ pieces, eager = 0 }: { pieces: Piece[]; eager?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-6 md:gap-y-12 xl:grid-cols-4">
      {pieces.map((p, i) => (
        <li key={p.slug}>
          <PieceCard piece={p} priority={i < eager} />
        </li>
      ))}
    </ul>
  );
}

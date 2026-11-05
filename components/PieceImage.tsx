// A catalogue image at two widths. Two kinds of name:
//   "rope-chain-22k-1"         a built-in render in public/images/pieces
//                              (WebP with a JPEG fallback)
//   "<shop id>/<photo id>"     a jeweller's upload in Supabase Storage
//                              (WebP, saved at 1600 px and 600 px)
type Props = {
  name: string;
  alt: string;
  sizes: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
};

const STORAGE = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/pieces`;

export const isUpload = (name: string) => name.includes("/");
export const uploadUrl = (name: string, small = false) => `${STORAGE}/${name}${small ? "-600" : ""}.webp`;

export function PieceImage({ name, alt, sizes, width = 1200, height = 1500, priority = false, className }: Props) {
  const common = { sizes, width, height, decoding: "async" as const, className, loading: priority ? ("eager" as const) : ("lazy" as const), fetchPriority: priority ? ("high" as const) : undefined };
  if (isUpload(name)) {
    // eslint-disable-next-line @next/next/no-img-element -- photos are already resized; Next's optimiser is off for static hosting
    return <img alt={alt} src={uploadUrl(name)} srcSet={`${uploadUrl(name, true)} 600w, ${uploadUrl(name)} 1600w`} {...common} />;
  }
  const half = Math.round(width / 2);
  const src = (ext: string) => `/images/pieces/${name}-${half}.${ext} ${half}w, /images/pieces/${name}.${ext} ${width}w`;
  return (
    <picture>
      <source type="image/webp" srcSet={src("webp")} sizes={sizes} />
      <img alt={alt} src={`/images/pieces/${name}.jpg`} srcSet={src("jpg")} {...common} />
    </picture>
  );
}

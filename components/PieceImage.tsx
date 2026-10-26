// Renders a catalogue image from public/images/pieces as WebP with a JPEG
// fallback, at two widths. Every image is a 4:5 render except the opening
// image, which is 10:7.
type Props = {
  name: string;
  alt: string;
  sizes: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
};

export function PieceImage({ name, alt, sizes, width = 1200, height = 1500, priority = false, className }: Props) {
  const half = Math.round(width / 2);
  const src = (ext: string) => `/images/pieces/${name}-${half}.${ext} ${half}w, /images/pieces/${name}.${ext} ${width}w`;
  return (
    <picture>
      <source type="image/webp" srcSet={src("webp")} sizes={sizes} />
      <img
        src={`/images/pieces/${name}.jpg`}
        srcSet={src("jpg")}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={className}
      />
    </picture>
  );
}

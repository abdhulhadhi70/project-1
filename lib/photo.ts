"use client";
// Prepares a photo in the browser before it is uploaded:
//   - turned the right way up (phones store rotation as metadata),
//   - resized to 1600 px and 600 px on the long side,
//   - re-encoded as WebP, which drops all metadata, location included,
//   - marked with the shop's name in a small corner watermark.
// Only these small files ever leave the phone.

export type PreparedPhoto = { full: Blob; small: Blob; width: number; height: number };

async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This file isn't a photo we can read. Use a JPEG, PNG, WebP or HEIC photo from your camera.");
  }
}

function render(img: ImageBitmap, maxSide: number, watermark: string | null): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;
  g.imageSmoothingQuality = "high";
  g.drawImage(img, 0, 0, w, h);
  if (watermark) {
    const size = Math.max(11, Math.round(w * 0.022));
    g.font = `500 ${size}px system-ui, sans-serif`;
    g.textAlign = "right";
    g.textBaseline = "bottom";
    g.shadowColor = "rgba(0,0,0,0.35)";
    g.shadowBlur = size * 0.4;
    g.fillStyle = "rgba(255,255,255,0.82)";
    g.fillText(watermark, w - size * 0.9, h - size * 0.7);
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't prepare the photo."))), "image/webp", 0.84));
}

export async function preparePhoto(file: File, shopName: string): Promise<PreparedPhoto> {
  if (file.size > 25 * 1024 * 1024) throw new Error("That photo is over 25 MB. Choose a smaller one.");
  const img = await decode(file);
  const [full, small] = await Promise.all([render(img, 1600, shopName), render(img, 600, shopName)]);
  return { full, small, width: img.width, height: img.height };
}

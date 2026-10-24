import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Cloudinary does resizing and format conversion, so Next's image
  // optimiser (which would need a paid Cloudflare Images binding) is off.
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;

initOpenNextCloudflareForDev();

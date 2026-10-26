import type { NextConfig } from "next";

// A static site: every page is pre-rendered to HTML at build time, so it can
// be hosted for free on Cloudflare Pages (or any static host).
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;

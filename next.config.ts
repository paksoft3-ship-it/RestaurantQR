import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images served from Vercel Blob storage.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    formats: ["image/avif", "image/webp"],
    // Render uploaded SVGs via next/image. Safe because uploads are admin-only
    // and served with a strict CSP + attachment disposition (no script exec).
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;

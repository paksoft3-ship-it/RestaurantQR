import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images served from Vercel Blob storage.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;

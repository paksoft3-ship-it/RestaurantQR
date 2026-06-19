import type { MetadataRoute } from "next";
import { appConfig } from "@/lib/config/app-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Admin and draft preview areas must never be indexed.
        disallow: ["/admin", "/admin/"],
      },
    ],
    sitemap: `${appConfig.baseUrl}/sitemap.xml`,
  };
}

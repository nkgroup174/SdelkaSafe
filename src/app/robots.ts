import type { MetadataRoute } from "next";

const base = process.env.APP_URL || "https://sdelkasafe.ru";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/api", "/app"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}

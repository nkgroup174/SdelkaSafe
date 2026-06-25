import type { MetadataRoute } from "next";

const base = process.env.APP_URL || "https://sdelkasafe.ru";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/catalog/products",
    "/catalog/services",
    "/about",
    "/contact",
    "/auth/login",
    "/auth/register",
  ];
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
}

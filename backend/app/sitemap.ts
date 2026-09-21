import type { MetadataRoute } from "next";

const routes = [
  "",
  "/x-reply-tool",
  "/resources",
  "/resources/how-to-grow-on-x-with-replies",
  "/pricing",
  "/support",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-20");

  return routes.map((route) => ({
    url: `https://axe.oddpages.site${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/x-reply-tool" ? 0.9 : 0.7,
  }));
}

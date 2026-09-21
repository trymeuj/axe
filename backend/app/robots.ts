import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account/", "/auth/", "/connect-extension/"],
    },
    sitemap: "https://axe.oddpages.site/sitemap.xml",
  };
}

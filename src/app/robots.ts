import type { MetadataRoute } from "next";

import { SITE_URL, isProductionSite } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionSite) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/*?workshop=",
          "/*?for=",
          "/*?interest=",
          "/*?type=",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
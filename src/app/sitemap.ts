import type { MetadataRoute } from "next";

import { legal } from "@/data/legal/shared";
import { serviceLinks } from "@/data/nav";
import { SITE_URL, isProductionSite } from "@/lib/site";

/* Switch to true once the /services/[slug] pages are built */
const SERVICE_PAGES_LIVE = false;

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isProductionSite) return [];

  const home: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  const services: MetadataRoute.Sitemap = SERVICE_PAGES_LIVE
    ? serviceLinks.map((service) => ({
        url: `${SITE_URL}${service.href}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      }))
    : [];

  const legalPages: MetadataRoute.Sitemap = [
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-and-cancellation",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: legal.updatedISO,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  return [...home, ...services, ...legalPages];
}
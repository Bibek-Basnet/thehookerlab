export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thehookerlab.co.nz"
).replace(/\/+$/, "");

export const PRODUCTION_HOST = "thehookerlab.co.nz";

export const isProductionSite =
  new URL(SITE_URL).hostname.replace(/^www\./, "") === PRODUCTION_HOST;
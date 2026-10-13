export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thehookerlab.co.nz"
).replace(/\/+$/, "");

export const PRODUCTION_HOST = "thehookerlab.co.nz";

export const isProductionSite =
  new URL(SITE_URL).hostname.replace(/^www\./, "") === PRODUCTION_HOST;

export const SITE_NAME = "The Hooker Lab";
export const DEFAULT_TITLE =
  "The Hooker Lab | Specialist Rugby Hooker Coaching in New Zealand";
export const DEFAULT_DESCRIPTION =
  "Specialist rugby hooker coaching in New Zealand with professional hooker Kurt Eklund. Throwing, lineout, scrummaging, mental skills and leadership for players, schools, clubs and unions.";
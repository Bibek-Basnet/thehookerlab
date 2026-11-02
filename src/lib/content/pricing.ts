export type PriceInput = {
  showPricing: boolean;
  showPrice: boolean;
  price: string | null;
  priceNote: string | null;
  priceFrom: boolean;
  currency: string;
};

export type StartingPrice = { amount: string; note: string | null };

/* "$99" in the site currency, or null for a missing price or a bad currency code. */
function formatPrice(price: string | null, currency: string): string | null {
  if (price == null) return null;
  const amount = Number(price);
  if (!Number.isFinite(amount)) return null;
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  try {
    return new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    /* An ill-formed currency code must hide the price, not break the page. */
    return null;
  }
}

const withNote = (formatted: string, note: string | null) =>
  note?.trim() ? `${formatted} ${note.trim()}` : formatted;

/* A price shows only when the global switch, the programme switch and a price are all present. */
export function priceLabel(input: PriceInput): string | null {
  if (!input.showPricing || !input.showPrice) return null;
  const formatted = formatPrice(input.price, input.currency);
  if (!formatted) return null;
  const amountWithNote = withNote(formatted, input.priceNote);
  return input.priceFrom ? `From ${amountWithNote}` : amountWithNote;
}

/* The lowest price across the given programmes, e.g. { amount: "$99", note:
   "per session" }, for the section heading. Follows only the global switch: a
   programme can hide its own price on its card and still set the "starting from"
   figure. */
export function startingPrice(
  rows: { price: string | null; priceNote: string | null }[],
  settings: { showPricing: boolean; currency: string },
): StartingPrice | null {
  if (!settings.showPricing) return null;
  const cheapest = rows
    .filter((r) => r.price != null && Number.isFinite(Number(r.price)))
    .sort((a, b) => Number(a.price) - Number(b.price))[0];
  if (!cheapest) return null;
  const amount = formatPrice(cheapest.price, settings.currency);
  return amount ? { amount, note: cheapest.priceNote?.trim() || null } : null;
}

export type PriceInput = {
  showPricing: boolean;
  showPrice: boolean;
  price: string | null;
  priceNote: string | null;
  currency: string;
};

/* A price shows only when the global switch, the programme switch and a price are all present. */
export function priceLabel(input: PriceInput): string | null {
  if (!input.showPricing || !input.showPrice || input.price == null) return null;
  const amount = Number(input.price);
  if (!Number.isFinite(amount)) return null;
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat("en-NZ", {
      style: "currency",
      currency: input.currency,
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(amount);
  } catch {
    /* An ill-formed currency code must hide the price, not break the page. */
    return null;
  }
  const note = input.priceNote?.trim();
  return note ? `${formatted} ${note}` : formatted;
}

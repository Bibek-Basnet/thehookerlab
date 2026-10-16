import { describe, expect, it } from "vitest";
import { priceLabel } from "@/lib/content/pricing";

const base = {
  showPricing: true,
  showPrice: true,
  price: "150.00",
  priceNote: null,
  priceFrom: false,
  currency: "NZD",
};

describe("priceLabel", () => {
  it("formats a whole-dollar price without cents", () => {
    expect(priceLabel(base)).toBe("$150");
  });

  it("keeps cents when present", () => {
    expect(priceLabel({ ...base, price: "149.50" })).toBe("$149.50");
  });

  it("appends the note", () => {
    expect(priceLabel({ ...base, priceNote: "per week" })).toBe("$150 per week");
  });

  it("prefixes 'From' when the programme asks for it", () => {
    expect(priceLabel({ ...base, price: "199", priceNote: "per session", priceFrom: true })).toBe(
      "From $199 per session",
    );
    expect(priceLabel({ ...base, price: "99", priceNote: "per week", priceFrom: false })).toBe(
      "$99 per week",
    );
  });

  it("is null when the global switch is off", () => {
    expect(priceLabel({ ...base, showPricing: false })).toBeNull();
  });

  it("is null when the programme switch is off", () => {
    expect(priceLabel({ ...base, showPrice: false })).toBeNull();
  });

  it("is null when there is no price", () => {
    expect(priceLabel({ ...base, price: null })).toBeNull();
  });

  it("returns null instead of throwing for an invalid currency code", () => {
    expect(priceLabel({ ...base, currency: "12A" })).toBeNull();
  });

  it("uses the settings currency", () => {
    expect(priceLabel({ ...base, currency: "AUD" })).toBe("A$150");
  });
});

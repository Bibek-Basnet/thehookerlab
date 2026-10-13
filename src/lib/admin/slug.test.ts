import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/admin/slug";

describe("slugify", () => {
  it("lowercases, strips punctuation and collapses spaces", () => {
    expect(slugify("School & Club Coaching!")).toBe("school-club-coaching");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("  --Throw-- ")).toBe("throw");
  });

  it("falls back to 'item' for empty input", () => {
    expect(slugify("!!!")).toBe("item");
  });
});

describe("uniqueSlug", () => {
  it("returns the base when free", () => {
    expect(uniqueSlug("throw", ["scrum"])).toBe("throw");
  });

  it("appends the first free numeric suffix", () => {
    expect(uniqueSlug("throw", ["throw", "throw-2"])).toBe("throw-3");
  });
});

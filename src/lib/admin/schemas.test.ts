import { describe, expect, it } from "vitest";
import {
  accountSchema,
  faqSchema,
  passwordSchema,
  pillarSchema,
  programSchema,
  settingsSchema,
} from "@/lib/admin/schemas";

const validProgram = {
  title: "Individual Hooker Coaching",
  slug: "",
  format: "One-on-one",
  summary: "Summary",
  listTitle: "At a glance",
  points: '["a","b"]',
  imageSrc: "/images/x.jpg",
  imageAlt: "alt",
  price: "",
  priceNote: "",
  showPrice: undefined,
  published: "on",
};

describe("programSchema", () => {
  it("accepts a valid programme with no price", () => {
    const r = programSchema.safeParse(validProgram);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.price).toBeNull();
      expect(r.data.showPrice).toBe(false);
      expect(r.data.published).toBe(true);
      expect(r.data.points).toEqual(["a", "b"]);
    }
  });

  it("accepts a decimal price and normalises it", () => {
    const r = programSchema.safeParse({ ...validProgram, price: "149.5" });
    expect(r.success && r.data.price).toBe("149.50");
  });

  it("rejects a price with symbols or thousands separators", () => {
    for (const bad of ["$1,200", "150 NZD", "abc", "-5"]) {
      const r = programSchema.safeParse({ ...validProgram, price: bad });
      expect(r.success, bad).toBe(false);
      if (!r.success) expect(r.error.issues[0].path).toEqual(["price"]);
    }
  });

  it("requires at least one point", () => {
    expect(programSchema.safeParse({ ...validProgram, points: "[]" }).success).toBe(false);
  });

  it("rejects a slug with spaces or capitals", () => {
    expect(programSchema.safeParse({ ...validProgram, slug: "Has Space" }).success).toBe(false);
  });
});

describe("pillarSchema", () => {
  it("parses skills as name/detail pairs and drops blank rows", () => {
    const r = pillarSchema.safeParse({
      word: "Throw",
      slug: "",
      summary: "s",
      imageSrc: "/i",
      imageAlt: "a",
      panel: "on",
      published: "on",
      skills: '[{"name":"A","detail":"a"},{"name":" ","detail":""}]',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skills).toEqual([{ name: "A", detail: "a" }]);
  });
});

describe("faqSchema", () => {
  it("requires question and answer", () => {
    const r = faqSchema.safeParse({ question: "", answer: "", published: "on" });
    expect(r.success).toBe(false);
  });
});

describe("settingsSchema", () => {
  it("uppercases the currency and normalises emails", () => {
    const r = settingsSchema.safeParse({
      contactEmail: "A@B.co",
      notificationEmail: "a@b.co",
      fromEmail: "noreply@b.co",
      fromName: "X",
      showPricing: "on",
      currency: "nzd",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.currency).toBe("NZD");
      expect(r.data.contactEmail).toBe("a@b.co");
      expect(r.data.showPricing).toBe(true);
    }
  });
});

describe("accountSchema and passwordSchema", () => {
  it("lowercases and trims the email", () => {
    const r = accountSchema.safeParse({ name: "Kurt", email: "  Kurt@Example.com " });
    expect(r.success && r.data.email).toBe("kurt@example.com");
  });

  it("requires the new password to match its confirmation and be 10+ chars", () => {
    expect(
      passwordSchema.safeParse({ currentPassword: "x", newPassword: "short", confirmPassword: "short" }).success,
    ).toBe(false);
    const r = passwordSchema.safeParse({
      currentPassword: "x",
      newPassword: "longenough1",
      confirmPassword: "different1",
    });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["confirmPassword"]);
    expect(
      passwordSchema.safeParse({ currentPassword: "x", newPassword: "longenough1", confirmPassword: "longenough1" }).success,
    ).toBe(true);
  });
});

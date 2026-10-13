import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/lib/forms/registration-schema";

const valid = {
  role: "A player",
  level: "Club",
  experience: "2 to 5 years",
  focusAreas: ["Throwing accuracy"],
  goal: "",
  name: "Sam",
  email: "sam@example.com",
  phone: "",
  location: "Wellington, New Zealand",
  privacyAccepted: true,
  acceptedAt: "2026-10-13T10:00:00.000Z",
  source: "online-programme",
};

describe("registrationSchema", () => {
  it("accepts a valid payload", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });

  it("requires privacy acceptance", () => {
    expect(registrationSchema.safeParse({ ...valid, privacyAccepted: false }).success).toBe(false);
  });

  it("only accepts the listed options", () => {
    expect(registrationSchema.safeParse({ ...valid, role: "Alien" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...valid, focusAreas: ["Juggling"] }).success).toBe(false);
  });

  it("carries the honeypot field through, defaulting to empty", () => {
    const r = registrationSchema.safeParse(valid);
    expect(r.success && r.data.company).toBe("");
    const spam = registrationSchema.safeParse({ ...valid, company: "Acme" });
    expect(spam.success && spam.data.company).toBe("Acme");
  });

  it("treats missing optional fields as empty strings", () => {
    const r = registrationSchema.safeParse({ ...valid, goal: undefined, phone: undefined });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.goal).toBe("");
  });
});

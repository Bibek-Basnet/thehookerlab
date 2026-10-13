import { describe, expect, it } from "vitest";
import { enquirySchema } from "@/lib/forms/enquiry-schema";

const valid = {
  enquiryType: "individual",
  workshopTopics: [],
  name: "Jane Doe",
  email: "jane@example.com",
  role: "parent",
  organisation: "",
  contactMethod: "email",
  phone: "",
  ageGroup: "",
  level: "",
  groupSize: "",
  location: "",
  timing: "",
  message: "Keen to start coaching soon",
  consentContact: true,
  updatesOnline: false,
  website: "",
  source: { page: "/", submittedAt: "2026-10-13T10:00:00.000Z" },
};

describe("enquirySchema", () => {
  it("accepts a valid payload", () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });

  it("requires an organisation for school, club, academy and union roles", () => {
    const r = enquirySchema.safeParse({ ...valid, role: "school" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["organisation"]);
    expect(
      enquirySchema.safeParse({ ...valid, role: "school", organisation: "Kings" }).success,
    ).toBe(true);
  });

  it("requires a phone when the contact method is not email", () => {
    expect(enquirySchema.safeParse({ ...valid, contactMethod: "whatsapp" }).success).toBe(false);
    expect(
      enquirySchema.safeParse({ ...valid, contactMethod: "whatsapp", phone: "+64 21 123 4567" })
        .success,
    ).toBe(true);
  });

  it("rejects a short message, missing consent and unknown enquiry type", () => {
    expect(enquirySchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, consentContact: false }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, enquiryType: "nope" }).success).toBe(false);
  });

  it("caps the message length at MESSAGE_MAX", () => {
    expect(enquirySchema.safeParse({ ...valid, message: "x".repeat(1501) }).success).toBe(false);
  });

  it("treats missing optional fields as empty", () => {
    const rest = Object.fromEntries(
      Object.entries(valid).filter(
        ([k]) => !["organisation", "phone", "location"].includes(k),
      ),
    );
    const r = enquirySchema.safeParse(rest);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.location).toBe("");
  });
});

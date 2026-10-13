import { describe, expect, it } from "vitest";
import {
  enquiryNotification,
  escapeHtml,
  registrationNotification,
} from "@/lib/email/templates";
import type { EnquiryRow, RegistrationRow } from "@/lib/db/schema";

const now = new Date("2026-10-13T10:00:00Z");

const enquiry: EnquiryRow = {
  id: 5,
  enquiryType: "individual",
  name: "Jane <b>Doe</b>",
  email: "jane@example.com",
  role: "parent",
  organisation: null,
  contactMethod: "email",
  phone: null,
  ageGroup: "15-18",
  level: "school",
  groupSize: null,
  location: "Auckland",
  timing: "asap",
  message: "<script>alert(1)</script> Keen to start",
  workshopTopics: [],
  consentContact: true,
  sourcePage: "/",
  submittedAt: now,
  status: "new",
  adminNotes: null,
  notifiedAt: null,
  notifyError: null,
  createdAt: now,
};

const registration: RegistrationRow = {
  id: 9,
  role: "A player",
  level: "Club",
  experience: "2 to 5 years",
  focusAreas: ["Throwing accuracy", "Leadership"],
  goal: null,
  name: "Sam",
  email: "sam@example.com",
  phone: null,
  location: "Wellington, NZ",
  privacyAccepted: true,
  acceptedAt: now,
  status: "new",
  adminNotes: null,
  notifiedAt: null,
  notifyError: null,
  createdAt: now,
};

describe("escapeHtml", () => {
  it("escapes the five HTML characters", () => {
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;",
    );
  });
});

describe("enquiryNotification", () => {
  const mail = enquiryNotification(enquiry, "https://thehookerlab.co.nz");

  it("names the sender and type in the subject", () => {
    expect(mail.subject).toBe("New enquiry from Jane <b>Doe</b> (individual)");
  });

  it("escapes user input in the html body but not the text body", () => {
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(mail.text).toContain("<script>alert(1)</script>");
  });

  it("links to the admin detail page", () => {
    expect(mail.html).toContain("https://thehookerlab.co.nz/admin/enquiries/5");
    expect(mail.text).toContain("https://thehookerlab.co.nz/admin/enquiries/5");
  });

  it("omits empty fields", () => {
    expect(mail.text).not.toContain("Organisation:");
    expect(mail.text).toContain("Location: Auckland");
  });
});

describe("registrationNotification", () => {
  const mail = registrationNotification(registration, "https://thehookerlab.co.nz");

  it("lists focus areas and links to the admin page", () => {
    expect(mail.text).toContain("Throwing accuracy, Leadership");
    expect(mail.html).toContain("/admin/registrations/9");
  });
});

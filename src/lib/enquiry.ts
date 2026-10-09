import { contact } from "@/data/contact";

export type ContactMethod = "email" | "whatsapp" | "phone";

/* Everything the form collects. This is also the backend contract. */
export type EnquiryValues = {
  enquiryType: string;
  workshopTopics: string[];
  name: string;
  email: string;
  role: string;
  organisation: string;
  contactMethod: ContactMethod;
  phone: string;
  ageGroup: string;
  level: string;
  groupSize: string;
  location: string;
  timing: string;
  message: string;
  consentContact: boolean;
  updatesOnline: boolean;
  /* Honeypot: real people leave this empty. Backend should drop any payload where it is filled. */
  website: string;
};

export type EnquiryPayload = EnquiryValues & {
  source: { page: string; submittedAt: string };
};

export type EnquiryErrors = Partial<Record<keyof EnquiryValues, string>>;

export const emptyEnquiry: EnquiryValues = {
  enquiryType: "",
  workshopTopics: [],
  name: "",
  email: "",
  role: "",
  organisation: "",
  contactMethod: "email",
  phone: "",
  ageGroup: "",
  level: "",
  groupSize: "",
  location: "",
  timing: "",
  message: "",
  consentContact: false,
  updatesOnline: false,
  website: "",
};

export const MESSAGE_MAX = 1500;

export const requiresOrganisation = (role: string) =>
  contact.orgRoles.includes(role);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEnquiry(v: EnquiryValues): EnquiryErrors {
  const e: EnquiryErrors = {};

  if (!v.enquiryType) e.enquiryType = "Choose what your enquiry is about.";

  if (v.name.trim().length < 2) e.name = "Enter your full name.";

  const email = v.email.trim();
  if (!email) e.email = "Enter your email address.";
  else if (!EMAIL.test(email))
    e.email = "Enter a valid email address, like name@example.com.";

  if (!v.role) e.role = "Tell us who you are.";

  if (requiresOrganisation(v.role) && v.organisation.trim().length < 2) {
    e.organisation = "Enter your school, club or organisation name.";
  }

  const phone = v.phone.trim();
  const digits = phone.replace(/\D/g, "");
  if (v.contactMethod !== "email" && !phone) {
    e.phone = "Add a phone number so we can reach you by WhatsApp or phone.";
  } else if (
    phone &&
    (digits.length < 7 || digits.length > 15 || /[^\d+()\s-]/.test(phone))
  ) {
    e.phone = "Enter a valid phone number, including the area code.";
  }

  if (v.message.trim().length < 15) {
    e.message =
      "Add a short message so we know how to help (at least 15 characters).";
  }

  if (!v.consentContact) {
    e.consentContact =
      "Please confirm that we can contact you about this enquiry.";
  }

  return e;
}

/*
  Sends the enquiry to the backend.
  - Endpoint: NEXT_PUBLIC_ENQUIRY_ENDPOINT (defaults to /api/enquiry)
  - Preview without a backend: set NEXT_PUBLIC_ENQUIRY_MOCK=true in .env.local
*/
const ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT ?? "/api/enquiry";

export async function submitEnquiry(values: EnquiryValues): Promise<void> {
  const payload: EnquiryPayload = {
    ...values,
    source: {
      page: window.location.pathname,
      submittedAt: new Date().toISOString(),
    },
  };

  if (process.env.NEXT_PUBLIC_ENQUIRY_MOCK === "true") {
    await new Promise((resolve) => setTimeout(resolve, 900));
    console.info("Enquiry (mock, not sent):", payload);
    return;
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Enquiry failed with status ${response.status}`);
  }
}
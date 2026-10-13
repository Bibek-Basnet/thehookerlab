import { z } from "zod";

import { contact } from "@/data/contact";
import { MESSAGE_MAX } from "@/lib/enquiry";

const ids = (list: { id: string }[]) =>
  list.map((o) => o.id) as [string, ...string[]];
const optionalId = (list: { id: string }[]) =>
  z.enum(ids(list)).or(z.literal("")).default("");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Mirrors validateEnquiry in src/lib/enquiry.ts; the browser form validates
   first, this is the server-side check on the raw JSON body. */
export const enquirySchema = z
  .object({
    enquiryType: z.enum(ids(contact.enquiryTypes)),
    workshopTopics: z.array(z.string().max(80)).max(20).default([]),
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().regex(EMAIL).max(200),
    role: z.enum(ids(contact.roles)),
    organisation: z.string().trim().max(200).default(""),
    contactMethod: z.enum(["email", "whatsapp", "phone"]),
    phone: z.string().trim().max(40).default(""),
    ageGroup: optionalId(contact.ageGroups),
    level: optionalId(contact.levels),
    groupSize: optionalId(contact.groupSizes),
    location: z.string().trim().max(120).default(""),
    timing: optionalId(contact.timings),
    message: z.string().trim().min(15).max(MESSAGE_MAX),
    consentContact: z.literal(true),
    updatesOnline: z.boolean().default(false),
    website: z.string().max(200).default(""),
    source: z.object({
      page: z.string().max(200),
      submittedAt: z.string().datetime(),
    }),
  })
  .superRefine((v, ctx) => {
    if (contact.orgRoles.includes(v.role) && v.organisation.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["organisation"],
        message: "Organisation is required for this role",
      });
    }
    const digits = v.phone.replace(/\D/g, "");
    if (v.contactMethod !== "email" && !v.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Phone is required for WhatsApp or phone contact",
      });
    } else if (
      v.phone &&
      (digits.length < 7 || digits.length > 15 || /[^\d+()\s-]/.test(v.phone))
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a valid phone number",
      });
    }
  });

export type EnquiryInput = z.infer<typeof enquirySchema>;

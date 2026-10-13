import { z } from "zod";

import { INBOX_STATUSES, SECTION_KEYS } from "@/lib/db/schema";
import { checkbox, jsonList } from "./form";

/* Browser textareas submit CRLF; store LF only. */
const lf = (s: string) => s.replace(/\r\n?/g, "\n");

const str = (max: number, label = "This field") =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `Keep it under ${max} characters`)
    .transform(lf);

/* Optional text: forms that omit the field entirely submit undefined, which
   reads as "" rather than a validation error. */
const optional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters`)
    .default("")
    .transform(lf);

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

/* next/image throws at render for anything that is not a root path or an
   https URL, which would take the public page down; reject it here. */
const IMAGE = /^(\/|https:\/\/)/;
const imageField = z
  .string()
  .trim()
  .min(1, "Image is required")
  .max(500, "Keep it under 500 characters")
  .regex(IMAGE, "Use a path starting with / or an https:// URL");
const optionalImage = z
  .string()
  .trim()
  .max(500, "Keep it under 500 characters")
  .default("")
  .refine((v) => v === "" || IMAGE.test(v), {
    message: "Use a path starting with / or an https:// URL",
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const slugField = z
  .string()
  .trim()
  .max(120)
  .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes only");

/* "" -> null; "150" -> "150.00"; anything with symbols or separators is rejected. */
export const priceField = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    if (!/^\d+(\.\d{1,2})?$/.test(v)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a number like 150 or 149.50, with no symbols",
      });
      return z.NEVER;
    }
    return Number(v).toFixed(2);
  });

export const programSchema = z.object({
  title: str(120, "Title"),
  slug: slugField,
  format: str(40, "Format"),
  summary: str(600, "Summary"),
  listTitle: str(60, "List title"),
  points: jsonList.pipe(
    z
      .array(z.string().max(120))
      .min(1, "Add at least one point")
      .max(8, "At most 8 points"),
  ),
  imageSrc: imageField,
  imageAlt: str(200, "Image description"),
  price: priceField,
  priceNote: optional(60),
  showPrice: checkbox,
  published: checkbox,
});
export type ProgramInput = z.infer<typeof programSchema>;

const pairs = z
  .string()
  .transform((raw, ctx) => {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("not an array");
      return parsed
        .map((p) => {
          const row = p as { name?: unknown; detail?: unknown };
          return {
            name: String(row.name ?? "").trim(),
            detail: String(row.detail ?? "").trim(),
          };
        })
        .filter((p) => p.name || p.detail);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid list" });
      return z.NEVER;
    }
  })
  .pipe(
    z
      .array(
        z.object({
          name: str(80, "Skill name"),
          detail: str(200, "Skill detail"),
        }),
      )
      .min(1, "Add at least one skill")
      .max(8, "At most 8 skills"),
  );

export const pillarSchema = z.object({
  word: str(40, "Word"),
  slug: slugField,
  summary: str(300, "Summary"),
  imageSrc: imageField,
  imageAlt: str(200, "Image description"),
  panel: checkbox,
  published: checkbox,
  skills: pairs,
});
export type PillarInput = z.infer<typeof pillarSchema>;

export const testimonialSchema = z.object({
  name: str(80, "Name"),
  role: str(80, "Role"),
  org: str(80, "Organisation"),
  imageSrc: imageField,
  quote: str(600, "Quote"),
  published: checkbox,
});
export type TestimonialInput = z.infer<typeof testimonialSchema>;

export const faqSchema = z.object({
  question: str(200, "Question"),
  answer: str(2000, "Answer"),
  published: checkbox,
});
export type FaqInput = z.infer<typeof faqSchema>;

export const sectionSchema = z.object({
  key: z.enum(SECTION_KEYS),
  eyebrow: str(40, "Eyebrow"),
  headline: str(200, "Headline"),
  headlineAccent: optional(60),
  intro: optional(600),
  ctaLabel: optional(60),
  ctaHref: optional(200),
  heroImage: optionalImage,
});
export type SectionInput = z.infer<typeof sectionSchema>;

export const settingsSchema = z.object({
  contactEmail: email,
  notificationEmail: email,
  fromEmail: email,
  fromName: str(80, "Sender name"),
  showPricing: checkbox,
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, "Use a 3-letter currency code")
    .toUpperCase(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const accountSchema = z.object({ name: str(80, "Name"), email });

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(10, "Use at least 10 characters").max(200),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const notesSchema = z.object({ notes: optional(2000) });
export const statusSchema = z.enum(INBOX_STATUSES);

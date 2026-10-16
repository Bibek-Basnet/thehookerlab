import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true })
  .defaultNow()
  .notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .notNull();
const textArray = (name: string) =>
  text(name).array().notNull().default(sql`'{}'::text[]`);

export const SECTION_KEYS = [
  "programs",
  "expertise",
  "testimonials",
  "faq",
  "contact",
  "online",
] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const INBOX_STATUSES = ["new", "read", "archived"] as const;
export type InboxStatus = (typeof INBOX_STATUSES)[number];

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt,
  updatedAt,
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey(),
  contactEmail: text("contact_email").notNull(),
  notificationEmail: text("notification_email").notNull(),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name").notNull(),
  showPricing: boolean("show_pricing").notNull().default(false),
  currency: text("currency").notNull().default("NZD"),
  updatedAt,
});

export const sectionCopy = pgTable("section_copy", {
  key: text("key").primaryKey(),
  eyebrow: text("eyebrow").notNull(),
  headline: text("headline").notNull(),
  headlineAccent: text("headline_accent"),
  intro: text("intro"),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  heroImage: text("hero_image"),
  updatedAt,
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  format: text("format").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  listTitle: text("list_title").notNull(),
  points: textArray("points"),
  imageSrc: text("image_src").notNull(),
  imageAlt: text("image_alt").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }),
  priceNote: text("price_note"),
  /* Renders "From $199 per session" when true. */
  priceFrom: boolean("price_from").notNull().default(true),
  showPrice: boolean("show_price").notNull().default(false),
  published: boolean("published").notNull().default(true),
  createdAt,
  updatedAt,
});

export const expertisePillars = pgTable("expertise_pillars", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  word: text("word").notNull(),
  summary: text("summary").notNull(),
  imageSrc: text("image_src").notNull(),
  imageAlt: text("image_alt").notNull(),
  panel: boolean("panel").notNull().default(true),
  published: boolean("published").notNull().default(true),
  createdAt,
  updatedAt,
});

export const expertiseSkills = pgTable("expertise_skills", {
  id: serial("id").primaryKey(),
  pillarId: integer("pillar_id")
    .notNull()
    .references(() => expertisePillars.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  name: text("name").notNull(),
  detail: text("detail").notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  name: text("name").notNull(),
  role: text("role").notNull(),
  org: text("org").notNull(),
  imageSrc: text("image_src").notNull(),
  quote: text("quote").notNull(),
  published: boolean("published").notNull().default(true),
  createdAt,
  updatedAt,
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  published: boolean("published").notNull().default(true),
  createdAt,
  updatedAt,
});

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  enquiryType: text("enquiry_type").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  organisation: text("organisation"),
  contactMethod: text("contact_method").notNull(),
  phone: text("phone"),
  ageGroup: text("age_group"),
  level: text("level"),
  groupSize: text("group_size"),
  location: text("location"),
  timing: text("timing"),
  message: text("message").notNull(),
  workshopTopics: textArray("workshop_topics"),
  consentContact: boolean("consent_contact").notNull(),
  sourcePage: text("source_page"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("new"),
  adminNotes: text("admin_notes"),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  notifyError: text("notify_error"),
  createdAt,
});

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  level: text("level").notNull(),
  experience: text("experience").notNull(),
  focusAreas: textArray("focus_areas"),
  goal: text("goal"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  location: text("location").notNull(),
  privacyAccepted: boolean("privacy_accepted").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("new"),
  adminNotes: text("admin_notes"),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
  notifyError: text("notify_error"),
  createdAt,
});

export type AdminUserRow = typeof adminUsers.$inferSelect;
export type SiteSettingsRow = typeof siteSettings.$inferSelect;
export type SectionCopyRow = typeof sectionCopy.$inferSelect;
export type ProgramRow = typeof programs.$inferSelect;
export type PillarRow = typeof expertisePillars.$inferSelect;
export type SkillRow = typeof expertiseSkills.$inferSelect;
export type TestimonialRow = typeof testimonials.$inferSelect;
export type FaqRow = typeof faqs.$inferSelect;
export type EnquiryRow = typeof enquiries.$inferSelect;
export type RegistrationRow = typeof registrations.$inferSelect;

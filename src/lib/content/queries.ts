import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDb } from "@/lib/db/client";
import {
  expertisePillars,
  expertiseSkills,
  faqs,
  programs,
  sectionCopy,
  siteSettings,
  testimonials,
  type SectionKey,
} from "@/lib/db/schema";
import {
  staticContact,
  staticExpertise,
  staticFaq,
  staticOnline,
  staticPrograms,
  staticSettings,
  staticTestimonials,
  withFallback,
} from "./fallback";
import {
  toContactSection,
  toExpertiseSection,
  toFaqSection,
  toOnlineCopy,
  toProgramsSection,
  toTestimonialsSection,
} from "./mappers";
import { TAGS } from "./tags";
import type {
  ContactSection,
  ExpertiseSection,
  FaqSection,
  OnlineCopy,
  ProgramsSection,
  PublicSettings,
  TestimonialsSection,
} from "./types";

async function copyFor(key: SectionKey) {
  const [row] = await getDb()
    .select()
    .from(sectionCopy)
    .where(eq(sectionCopy.key, key));
  if (!row) throw new Error(`section_copy.${key} missing; run npm run db:seed`);
  return row;
}

async function settingsRow() {
  const [row] = await getDb()
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  if (!row) throw new Error("site_settings missing; run npm run db:seed");
  return row;
}

/* A failed read is cached only briefly so the next visit retries the database. */
const retrySoon = () => cacheLife("minutes");

export async function getProgramsSection(): Promise<ProgramsSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.programs, TAGS.sections, TAGS.settings);
  return withFallback(
    "programs",
    async () => {
      const rows = await getDb()
        .select()
        .from(programs)
        .orderBy(asc(programs.sortOrder), asc(programs.id));
      return toProgramsSection(await copyFor("programs"), rows, await settingsRow());
    },
    staticPrograms,
    retrySoon,
  );
}

export async function getExpertiseSection(): Promise<ExpertiseSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.expertise, TAGS.sections);
  return withFallback(
    "expertise",
    async () => {
      const db = getDb();
      const pillars = await db
        .select()
        .from(expertisePillars)
        .orderBy(asc(expertisePillars.sortOrder), asc(expertisePillars.id));
      const skills = await db
        .select()
        .from(expertiseSkills)
        .orderBy(asc(expertiseSkills.sortOrder), asc(expertiseSkills.id));
      return toExpertiseSection(await copyFor("expertise"), pillars, skills);
    },
    staticExpertise,
    retrySoon,
  );
}

export async function getTestimonialsSection(): Promise<TestimonialsSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.testimonials, TAGS.sections);
  return withFallback(
    "testimonials",
    async () => {
      const rows = await getDb()
        .select()
        .from(testimonials)
        .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
      return toTestimonialsSection(await copyFor("testimonials"), rows);
    },
    staticTestimonials,
    retrySoon,
  );
}

export async function getFaqSection(): Promise<FaqSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.faqs, TAGS.sections);
  return withFallback(
    "faq",
    async () => {
      const rows = await getDb()
        .select()
        .from(faqs)
        .orderBy(asc(faqs.sortOrder), asc(faqs.id));
      return toFaqSection(await copyFor("faq"), rows);
    },
    staticFaq,
    retrySoon,
  );
}

export async function getContactSection(): Promise<ContactSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.sections, TAGS.settings);
  return withFallback(
    "contact",
    async () => toContactSection(await copyFor("contact"), await settingsRow()),
    staticContact,
    retrySoon,
  );
}

export async function getOnlineCopy(): Promise<OnlineCopy> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.sections);
  return withFallback(
    "online",
    async () => toOnlineCopy(await copyFor("online")),
    staticOnline,
    retrySoon,
  );
}

export async function getSiteSettings(): Promise<PublicSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.settings);
  return withFallback(
    "settings",
    async () => ({ contactEmail: (await settingsRow()).contactEmail }),
    staticSettings,
    retrySoon,
  );
}

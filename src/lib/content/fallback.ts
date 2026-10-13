import type { SectionKey } from "@/lib/db/schema";
import {
  toContactSection,
  toExpertiseSection,
  toFaqSection,
  toOnlineCopy,
  toProgramsSection,
  toTestimonialsSection,
} from "./mappers";
import {
  seedFaqs,
  seedPillars,
  seedPrograms,
  seedSectionCopy,
  seedSettings,
  seedTestimonials,
} from "./seed-data";

/* In production a failed read serves the static content instead of an error page.
   In development the error propagates so problems stay visible. */
export async function withFallback<T>(
  name: string,
  read: () => Promise<T>,
  fallback: () => T,
  onFallback?: () => void,
): Promise<T> {
  try {
    return await read();
  } catch (err) {
    if (process.env.NODE_ENV !== "production") throw err;
    console.error(`[content] ${name} failed, serving static fallback`, err);
    onFallback?.();
    return fallback();
  }
}

const now = new Date(0);
const copyRow = (key: SectionKey) => ({
  key,
  ...seedSectionCopy[key],
  updatedAt: now,
});
const settingsRow = { ...seedSettings, updatedAt: now };
const withIds = <T>(rows: T[]) =>
  rows.map((r, i) => ({ id: i + 1, createdAt: now, updatedAt: now, ...r }));

export const staticPrograms = () =>
  toProgramsSection(copyRow("programs"), withIds(seedPrograms), settingsRow);

export const staticExpertise = () => {
  const pillars = withIds(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    seedPillars.map(({ skills: _skills, ...p }) => p),
  );
  const skills = seedPillars.flatMap((p, pi) =>
    p.skills.map((s, si) => ({ id: pi * 100 + si + 1, pillarId: pi + 1, ...s })),
  );
  return toExpertiseSection(copyRow("expertise"), pillars, skills);
};

export const staticTestimonials = () =>
  toTestimonialsSection(copyRow("testimonials"), withIds(seedTestimonials));

export const staticFaq = () => toFaqSection(copyRow("faq"), withIds(seedFaqs));

export const staticContact = () =>
  toContactSection(copyRow("contact"), settingsRow);

export const staticOnline = () => toOnlineCopy(copyRow("online"));

export const staticSettings = () => ({ contactEmail: settingsRow.contactEmail });

import type {
  FaqRow,
  PillarRow,
  ProgramRow,
  SectionCopyRow,
  SiteSettingsRow,
  SkillRow,
  TestimonialRow,
} from "@/lib/db/schema";
import { priceLabel } from "./pricing";
import type {
  AccentHeadline,
  ContactSection,
  ExpertiseSection,
  FaqSection,
  OnlineCopy,
  ProgramsSection,
  TestimonialsSection,
} from "./types";

export const headlineLines = (text: string): string[] =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export const accentHeadline = (copy: SectionCopyRow): AccentHeadline => ({
  plain: copy.headline.trim(),
  accent: copy.headlineAccent?.trim() ?? "",
});

export const programNumber = (index: number) =>
  String(index + 1).padStart(2, "0");

const bySort = <T extends { sortOrder: number; id: number }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.id - b.id;

export function toProgramsSection(
  copy: SectionCopyRow,
  rows: ProgramRow[],
  settings: SiteSettingsRow,
): ProgramsSection {
  const items = rows
    .filter((r) => r.published)
    .sort(bySort)
    .map((r, i) => ({
      id: r.slug,
      number: programNumber(i),
      format: r.format,
      title: r.title,
      summary: r.summary,
      listTitle: r.listTitle,
      points: r.points,
      image: { src: r.imageSrc, alt: r.imageAlt },
      priceLabel: priceLabel({
        showPricing: settings.showPricing,
        showPrice: r.showPrice,
        price: r.price,
        priceNote: r.priceNote,
        currency: settings.currency,
      }),
    }));
  return {
    eyebrow: copy.eyebrow,
    headline: headlineLines(copy.headline),
    cta: {
      label: copy.ctaLabel ?? "Get in touch",
      href: copy.ctaHref ?? "/#contact",
    },
    items,
  };
}

export function toExpertiseSection(
  copy: SectionCopyRow,
  pillars: PillarRow[],
  skills: SkillRow[],
): ExpertiseSection {
  return {
    eyebrow: copy.eyebrow,
    headline: accentHeadline(copy),
    intro: copy.intro ?? "",
    pillars: pillars
      .filter((p) => p.published)
      .sort(bySort)
      .map((p) => ({
        id: p.slug,
        image: p.imageSrc,
        alt: p.imageAlt,
        word: p.word,
        summary: p.summary,
        panel: p.panel,
        skills: skills
          .filter((s) => s.pillarId === p.id)
          .sort(bySort)
          .map((s) => ({ name: s.name, detail: s.detail })),
      })),
  };
}

export function toTestimonialsSection(
  copy: SectionCopyRow,
  rows: TestimonialRow[],
): TestimonialsSection {
  return {
    eyebrow: copy.eyebrow,
    headline: accentHeadline(copy),
    items: rows
      .filter((r) => r.published)
      .sort(bySort)
      .map((r) => ({
        id: String(r.id),
        name: r.name,
        role: r.role,
        org: r.org,
        image: r.imageSrc,
        quote: r.quote,
      })),
  };
}

export function toFaqSection(copy: SectionCopyRow, rows: FaqRow[]): FaqSection {
  return {
    eyebrow: copy.eyebrow,
    headline: headlineLines(copy.headline),
    intro: copy.intro ?? "",
    heroImage: copy.heroImage ?? "/images/FAQ.jpeg",
    items: rows
      .filter((r) => r.published)
      .sort(bySort)
      .map((r) => ({ id: String(r.id), question: r.question, answer: r.answer })),
  };
}

export function toContactSection(
  copy: SectionCopyRow,
  settings: SiteSettingsRow,
): ContactSection {
  return {
    eyebrow: copy.eyebrow,
    headline: headlineLines(copy.headline),
    intro: copy.intro ?? "",
    email: settings.contactEmail,
  };
}

export const toOnlineCopy = (copy: SectionCopyRow): OnlineCopy => ({
  ctaLabel: copy.ctaLabel ?? "Register for the online programme",
});

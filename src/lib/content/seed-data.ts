import { contact } from "@/data/contact";
import { expertise } from "@/data/expertise";
import { faq } from "@/data/faq";
import { services } from "@/data/services";
import { testimonials } from "@/data/testimonials";
import type { SectionKey } from "@/lib/db/schema";

export type SeedSection = {
  eyebrow: string;
  headline: string;
  headlineAccent: string | null;
  intro: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  heroImage: string | null;
};

export const seedSectionCopy: Record<SectionKey, SeedSection> = {
  programs: {
    eyebrow: services.eyebrow,
    headline: services.headline.join("\n"),
    headlineAccent: null,
    intro: null,
    ctaLabel: services.cta.label,
    ctaHref: services.cta.href,
    heroImage: null,
  },
  expertise: {
    eyebrow: expertise.eyebrow,
    headline: expertise.headline.plain,
    headlineAccent: expertise.headline.accent,
    intro: expertise.intro,
    ctaLabel: null,
    ctaHref: null,
    heroImage: null,
  },
  testimonials: {
    eyebrow: testimonials.eyebrow,
    headline: testimonials.headline.plain,
    headlineAccent: testimonials.headline.accent,
    intro: null,
    ctaLabel: null,
    ctaHref: null,
    heroImage: null,
  },
  faq: {
    eyebrow: faq.eyebrow,
    headline: faq.headline.join("\n"),
    headlineAccent: null,
    intro: faq.intro,
    ctaLabel: null,
    ctaHref: null,
    heroImage: faq.heroImage,
  },
  contact: {
    eyebrow: contact.eyebrow,
    headline: contact.headline.join("\n"),
    headlineAccent: null,
    intro: contact.intro,
    ctaLabel: null,
    ctaHref: null,
    heroImage: null,
  },
  online: {
    eyebrow: "Online programme",
    headline: "Online hooker programme",
    headlineAccent: null,
    intro: null,
    ctaLabel: "Register for the online programme",
    ctaHref: null,
    heroImage: null,
  },
};

export const seedPrograms = services.items.map((item, i) => ({
  slug: item.id,
  sortOrder: i,
  format: item.format,
  title: item.title,
  summary: item.summary,
  listTitle: item.listTitle,
  points: [...item.points],
  imageSrc: item.image.src,
  imageAlt: item.image.alt,
  price: null as string | null,
  priceNote: null as string | null,
  /* Session-based programmes say "From"; the weekly online programme does not. */
  priceFrom: item.id !== "online-one-on-one",
  showPrice: false,
  published: true,
}));

export const seedPillars = expertise.pillars.map((p, i) => ({
  slug: p.id,
  sortOrder: i,
  word: p.word,
  summary: p.summary,
  imageSrc: p.image,
  imageAlt: p.alt,
  panel: p.panel,
  published: true,
  skills: p.skills.map((s, j) => ({
    sortOrder: j,
    name: s.name,
    detail: s.detail,
  })),
}));

export const seedTestimonials = testimonials.items.map((t, i) => ({
  sortOrder: i,
  name: t.name,
  role: t.role,
  org: t.org,
  imageSrc: t.image,
  quote: t.quote,
  published: true,
}));

export const seedFaqs = faq.items.map((f, i) => ({
  sortOrder: i,
  question: f.question,
  answer: f.answer,
  published: true,
}));

export const seedSettings = {
  id: 1,
  contactEmail: contact.email,
  notificationEmail: contact.email,
  fromEmail: "noreply@thehookerlab.co.nz",
  fromName: "The Hooker Lab",
  showPricing: false,
  currency: "NZD",
};

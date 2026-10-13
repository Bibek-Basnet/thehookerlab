export type AccentHeadline = { plain: string; accent: string };

export type ProgramItem = {
  id: string;
  number: string;
  format: string;
  title: string;
  summary: string;
  listTitle: string;
  points: string[];
  image: { src: string; alt: string };
  priceLabel: string | null;
};

export type ProgramsSection = {
  eyebrow: string;
  headline: string[];
  cta: { label: string; href: string };
  items: ProgramItem[];
};

export type ExpertiseSkill = { name: string; detail: string };

export type ExpertisePillar = {
  id: string;
  image: string;
  alt: string;
  word: string;
  summary: string;
  panel: boolean;
  skills: ExpertiseSkill[];
};

export type ExpertiseSection = {
  eyebrow: string;
  headline: AccentHeadline;
  intro: string;
  pillars: ExpertisePillar[];
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  org: string;
  image: string;
  quote: string;
};

export type TestimonialsSection = {
  eyebrow: string;
  headline: AccentHeadline;
  items: TestimonialItem[];
};

export type FaqItem = { id: string; question: string; answer: string };

export type FaqSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  heroImage: string;
  items: FaqItem[];
};

export type ContactSection = {
  eyebrow: string;
  headline: string[];
  intro: string;
  email: string;
};

export type OnlineCopy = { ctaLabel: string };

export type PublicSettings = { contactEmail: string };

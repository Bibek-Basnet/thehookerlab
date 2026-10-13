# Admin Panel and Database-Backed Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make programmes, expertise, testimonials, FAQ, section headings and site settings editable from a protected `/admin` panel backed by Neon Postgres, and store plus email contact enquiries and online registrations.

**Architecture:** Drizzle ORM over Postgres is the single data layer. Public pages read through `'use cache'` readers tagged per content type and pass typed props to the existing animated client components. Admin pages are dynamic server components whose forms post to server actions that validate with zod, write with Drizzle, and call `updateTag`. Two route handlers receive the public forms, insert rows and send Resend notifications.

**Tech Stack:** Next.js 16.4 (Cache Components on), React 19, Tailwind 4, Drizzle ORM 0.45 + drizzle-kit 0.31, `pg` 8, zod 4, iron-session 9, bcryptjs 3, resend 6, vitest 5, tsx, dotenv.

**Spec:** `docs/superpowers/specs/2026-10-13-admin-panel-design.md`

## Global Constraints

- Next.js stays at 16.4.0 with `cacheComponents: true` and `partialPrefetching: true`; read `node_modules/next/dist/docs/` before using any framework API you are unsure of.
- `updateTag` is only legal inside server actions; route handlers must use `revalidateTag(tag, 'max')` if they ever need invalidation (they do not in this plan).
- Any component that reads `cookies()`, `params`, `searchParams` or uncached DB data must sit inside a `<Suspense>` boundary.
- Cache tags are exactly: `content:programs`, `content:expertise`, `content:testimonials`, `content:faqs`, `content:sections`, `content:settings`.
- Session cookie name is `thl_admin`; `SESSION_SECRET` must be at least 32 characters.
- Public URLs do not change. The admin lives under `/admin`.
- Never commit `.env.local`. Never log the database URL or passwords.
- Styling uses the existing tokens only: `ink`, `coal`, `steel`, `line`, `bone`, `mist`, `accent`, `accent-deep`, `paper`, `paper-deep`; fonts `font-display` and `font-body`.
- Commit after every task with a conventional message and the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Windows host: run commands with `npm`/`npx`; paths in code use forward slashes.

## Review Focus

1. **Headline text with blank or trailing lines** — the public heading must drop empty lines, not render empty spans. Test in Task 4 (`headlineLines`).
2. **Price typed as "$1,200" or "150 NZD"** — the programme form must reject it with a clear message instead of saving `NaN`. Test in Task 10 (`programSchema`).
3. **Login email with capitals or spaces** — must still match the stored lowercase email. Test in Task 10 (`loginSchema` normalises).
4. **Reorder on the first item moving up, or a single-item list** — must be a no-op, never a crash or a duplicate. Test in Task 10 (`reorderIds`).
5. **HTML in an enquiry message** — must be escaped in the notification email. Test in Task 15 (`escapeHtml`, template).

---

## Phase 1 — Foundations

### Task 1: Dependencies, env example, test runner, scripts

**Files:**
- Modify: `package.json`
- Create: `.env.example`, `vitest.config.ts`, `src/lib/smoke.test.ts`

**Interfaces:**
- Produces: npm scripts `test`, `test:watch`, `db:generate`, `db:migrate`, `db:seed`, `db:studio`; path alias `@/` works in tests.

- [ ] **Step 1: Install dependencies**

```bash
npm install drizzle-orm@0.45.4 pg@8.23.1 zod@4.6.7 iron-session@9.0.1 bcryptjs@3.0.3 resend@6.32.1
npm install -D drizzle-kit@0.31.11 @types/pg@8.23.1 tsx@4.23.15 vitest@5.0.4 dotenv@18.0.7
```

(`bcryptjs` 3 ships its own types; do not add `@types/bcryptjs`.)

- [ ] **Step 2: Add scripts to `package.json`**

Replace the `scripts` block with:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "db:studio": "drizzle-kit studio",
  "db:seed": "tsx scripts/seed.ts"
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: { include: ["src/**/*.test.ts", "scripts/**/*.test.ts"], environment: "node" },
});
```

- [ ] **Step 4: Create `.env.example`**

```bash
# Postgres (Neon pooled connection string)
DATABASE_URL=postgresql://user:password@host/db?sslmode=require

# 32+ random characters. Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
SESSION_SECRET=

# Used once by `npm run db:seed` to create the first admin
ADMIN_EMAIL=admin@thehookerlab.co.nz
ADMIN_PASSWORD=change-me-now

# Resend. RESEND_FROM must be on a verified domain, e.g. "The Hooker Lab <noreply@thehookerlab.co.nz>"
RESEND_API_KEY=
RESEND_FROM=The Hooker Lab <noreply@thehookerlab.co.nz>

NEXT_PUBLIC_SITE_URL=https://thehookerlab.co.nz
```

Then add `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `RESEND_FROM` to the existing `.env.local` (keep its `DATABASE_URL`). Generate the secret with the node one-liner above.

- [ ] **Step 5: Write a smoke test that proves the alias works**

`src/lib/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("test runner", () => {
  it("resolves the @ alias", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
```

- [ ] **Step 6: Run it**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json .env.example vitest.config.ts src/lib/smoke.test.ts
git commit -m "chore: add drizzle, zod, iron-session, resend, vitest and db scripts"
```

### Task 2: Drizzle schema, config and first migration

**Files:**
- Create: `src/lib/db/schema.ts`, `drizzle.config.ts`, `drizzle/` (generated)

**Interfaces:**
- Produces: tables `adminUsers`, `siteSettings`, `sectionCopy`, `programs`, `expertisePillars`, `expertiseSkills`, `testimonials`, `faqs`, `enquiries`, `registrations`; row types `ProgramRow = typeof programs.$inferSelect` etc.; constants `SECTION_KEYS`, `INBOX_STATUSES`.

- [ ] **Step 1: Create `src/lib/db/schema.ts`**

```ts
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

const createdAt = timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const updatedAt = timestamp("updated_at", { withTimezone: true }).defaultNow().notNull();
const textArray = (name: string) =>
  text(name).array().notNull().default(sql`'{}'::text[]`);

export const SECTION_KEYS = ["programs", "expertise", "testimonials", "faq", "contact", "online"] as const;
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
```

- [ ] **Step 2: Create `drizzle.config.ts`**

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });
config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
```

- [ ] **Step 3: Generate and apply the migration**

Run: `npm run db:generate`
Expected: `drizzle/0000_*.sql` and `drizzle/meta/` created, listing all ten tables.

Run: `npm run db:migrate`
Expected: "migrations applied" with no error. Verify with `npx drizzle-kit studio` or `npx tsx -e "..."`; simplest check is re-running `npm run db:migrate`, which should report nothing to apply.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts drizzle.config.ts drizzle
git commit -m "feat(db): add drizzle schema and initial migration"
```

### Task 3: Database client and idempotent seed

**Files:**
- Create: `src/lib/db/client.ts`, `scripts/seed.ts`, `src/lib/auth/password.ts`, `src/lib/content/seed-data.ts`

**Interfaces:**
- Produces: `getDb(): Db` (singleton), `hashPassword(plain)`, `verifyPassword(plain, hash)`, `seedSectionCopy: Record<SectionKey, {...}>`, `seedPrograms`, `seedPillars`, `seedTestimonials`, `seedFaqs` (all derived from `src/data/*`).

- [ ] **Step 1: Create `src/lib/db/client.ts`**

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const g = globalThis as unknown as { __thlPool?: Pool; __thlDb?: ReturnType<typeof build> };

function build() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  g.__thlPool ??= new Pool({ connectionString: url, max: 5 });
  return drizzle(g.__thlPool, { schema });
}

export function getDb() {
  g.__thlDb ??= build();
  return g.__thlDb;
}

export type Db = ReturnType<typeof getDb>;
```

- [ ] **Step 2: Create `src/lib/auth/password.ts`**

```ts
import bcrypt from "bcryptjs";

const ROUNDS = 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, ROUNDS);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);
```

- [ ] **Step 3: Create `src/lib/content/seed-data.ts`** (static content shaped as insert rows; also used by the production fallback in Task 5)

```ts
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
  skills: p.skills.map((s, j) => ({ sortOrder: j, name: s.name, detail: s.detail })),
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
```

- [ ] **Step 4: Create `scripts/seed.ts`**

```ts
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { count, eq } from "drizzle-orm";

import { hashPassword } from "@/lib/auth/password";
import {
  seedFaqs,
  seedPillars,
  seedPrograms,
  seedSectionCopy,
  seedSettings,
  seedTestimonials,
} from "@/lib/content/seed-data";
import { getDb } from "@/lib/db/client";
import {
  SECTION_KEYS,
  adminUsers,
  expertisePillars,
  expertiseSkills,
  faqs,
  programs,
  sectionCopy,
  siteSettings,
  testimonials,
} from "@/lib/db/schema";

async function isEmpty(table: Parameters<ReturnType<typeof getDb>["select"]>[0] extends never ? never : any) {
  const db = getDb();
  const [row] = await db.select({ n: count() }).from(table);
  return Number(row.n) === 0;
}

async function main() {
  const db = getDb();
  const log = (m: string) => console.log(`[seed] ${m}`);

  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1));
  if (!settings) {
    await db.insert(siteSettings).values(seedSettings);
    log("site_settings created");
  }

  for (const key of SECTION_KEYS) {
    const [row] = await db.select().from(sectionCopy).where(eq(sectionCopy.key, key));
    if (!row) {
      await db.insert(sectionCopy).values({ key, ...seedSectionCopy[key] });
      log(`section_copy.${key} created`);
    }
  }

  if (await isEmpty(adminUsers)) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the first admin");
    await db.insert(adminUsers).values({ email, name: "Admin", passwordHash: await hashPassword(password) });
    log(`admin ${email} created`);
  }

  if (await isEmpty(programs)) {
    await db.insert(programs).values(seedPrograms);
    log(`${seedPrograms.length} programmes inserted`);
  }

  if (await isEmpty(expertisePillars)) {
    for (const { skills, ...pillar } of seedPillars) {
      const [inserted] = await db.insert(expertisePillars).values(pillar).returning({ id: expertisePillars.id });
      await db.insert(expertiseSkills).values(skills.map((s) => ({ ...s, pillarId: inserted.id })));
    }
    log(`${seedPillars.length} pillars inserted`);
  }

  if (await isEmpty(testimonials)) {
    await db.insert(testimonials).values(seedTestimonials);
    log(`${seedTestimonials.length} testimonials inserted`);
  }

  if (await isEmpty(faqs)) {
    await db.insert(faqs).values(seedFaqs);
    log(`${seedFaqs.length} faqs inserted`);
  }

  log("done");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

Replace the awkward `isEmpty` signature with the simple form if TypeScript complains:

```ts
import type { PgTable } from "drizzle-orm/pg-core";
async function isEmpty(table: PgTable) { ... }
```

`tsx` must resolve `@/` — it reads `tsconfig.json` paths automatically, so no extra config is needed.

- [ ] **Step 5: Run the seed twice**

Run: `npm run db:seed`
Expected: lines for settings, six section keys, admin, 4 programmes, 3 pillars, 6 testimonials, 7 faqs, then `done`.

Run: `npm run db:seed` again
Expected: only `[seed] done`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/db/client.ts src/lib/auth/password.ts src/lib/content/seed-data.ts scripts/seed.ts
git commit -m "feat(db): add client, password hashing and idempotent seed"
```

## Phase 2 — Public site reads from the database

### Task 4: Content types, mappers and the pricing rule

**Files:**
- Create: `src/lib/content/types.ts`, `src/lib/content/pricing.ts`, `src/lib/content/mappers.ts`
- Test: `src/lib/content/pricing.test.ts`, `src/lib/content/mappers.test.ts`

**Interfaces:**
- Produces: all `*Section` types below; `priceLabel(input)`; `headlineLines(text)`; `programNumber(i)`; `toProgramsSection(copy, rows, settings)`; `toExpertiseSection(copy, pillars, skills)`; `toTestimonialsSection(copy, rows)`; `toFaqSection(copy, rows)`; `toContactSection(copy, settings)`; `toOnlineCopy(copy)`.

- [ ] **Step 1: Create `src/lib/content/types.ts`**

```ts
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
```

- [ ] **Step 2: Write the failing pricing test** — `src/lib/content/pricing.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { priceLabel } from "@/lib/content/pricing";

const base = { showPricing: true, showPrice: true, price: "150.00", priceNote: null, currency: "NZD" };

describe("priceLabel", () => {
  it("formats a whole-dollar price without cents", () => {
    expect(priceLabel(base)).toBe("$150");
  });
  it("keeps cents when present", () => {
    expect(priceLabel({ ...base, price: "149.50" })).toBe("$149.50");
  });
  it("appends the note", () => {
    expect(priceLabel({ ...base, priceNote: "per week" })).toBe("$150 per week");
  });
  it("is null when the global switch is off", () => {
    expect(priceLabel({ ...base, showPricing: false })).toBeNull();
  });
  it("is null when the programme switch is off", () => {
    expect(priceLabel({ ...base, showPrice: false })).toBeNull();
  });
  it("is null when there is no price", () => {
    expect(priceLabel({ ...base, price: null })).toBeNull();
  });
  it("uses the settings currency", () => {
    expect(priceLabel({ ...base, currency: "AUD" })).toBe("A$150");
  });
});
```

- [ ] **Step 3: Run it** — `npx vitest run src/lib/content/pricing.test.ts` — Expected: FAIL, module not found.

- [ ] **Step 4: Create `src/lib/content/pricing.ts`**

```ts
export type PriceInput = {
  showPricing: boolean;
  showPrice: boolean;
  price: string | null;
  priceNote: string | null;
  currency: string;
};

export function priceLabel(input: PriceInput): string | null {
  if (!input.showPricing || !input.showPrice || input.price == null) return null;
  const amount = Number(input.price);
  if (!Number.isFinite(amount)) return null;
  const formatted = new Intl.NumberFormat("en-NZ", {
    style: "currency",
    currency: input.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  const note = input.priceNote?.trim();
  return note ? `${formatted} ${note}` : formatted;
}
```

- [ ] **Step 5: Run it** — Expected: 7 passed. If `AUD` renders as `$150` on your ICU, change that assertion to `toMatch(/150$/)`; the rule under test is the currency being passed through, not the glyph.

- [ ] **Step 6: Write the failing mappers test** — `src/lib/content/mappers.test.ts`

```ts
import { describe, expect, it } from "vitest";
import {
  headlineLines,
  programNumber,
  toExpertiseSection,
  toFaqSection,
  toProgramsSection,
} from "@/lib/content/mappers";
import { seedSectionCopy, seedSettings } from "@/lib/content/seed-data";
import type { FaqRow, PillarRow, ProgramRow, SectionCopyRow, SkillRow } from "@/lib/db/schema";

const now = new Date();
const copy = (key: string, s = seedSectionCopy.programs): SectionCopyRow => ({ key, ...s, updatedAt: now });

const program = (over: Partial<ProgramRow>): ProgramRow => ({
  id: 1, slug: "p", sortOrder: 0, format: "Online", title: "T", summary: "S", listTitle: "L",
  points: ["a"], imageSrc: "/i.jpg", imageAlt: "alt", price: null, priceNote: null,
  showPrice: false, published: true, createdAt: now, updatedAt: now, ...over,
});

describe("headlineLines", () => {
  it("splits on newlines and drops blank or trailing lines", () => {
    expect(headlineLines("Choose how\n\nyou train.\n")).toEqual(["Choose how", "you train."]);
  });
  it("trims each line", () => {
    expect(headlineLines("  A \n B ")).toEqual(["A", "B"]);
  });
});

describe("programNumber", () => {
  it("pads to two digits", () => {
    expect(programNumber(0)).toBe("01");
    expect(programNumber(11)).toBe("12");
  });
});

describe("toProgramsSection", () => {
  it("drops unpublished rows and numbers by published position", () => {
    const rows = [program({ id: 1, slug: "a", published: false }), program({ id: 2, slug: "b" }), program({ id: 3, slug: "c" })];
    const out = toProgramsSection(copy("programs"), rows, { ...seedSettings, updatedAt: now });
    expect(out.items.map((i) => i.id)).toEqual(["b", "c"]);
    expect(out.items[0].number).toBe("01");
    expect(out.headline).toEqual(["Choose how", "you train."]);
    expect(out.cta).toEqual({ label: "Get in touch", href: "/#contact" });
  });
  it("resolves the price label through the pricing rule", () => {
    const rows = [program({ price: "90", showPrice: true })];
    const out = toProgramsSection(copy("programs"), rows, { ...seedSettings, showPricing: true, updatedAt: now });
    expect(out.items[0].priceLabel).toBe("$90");
  });
});

describe("toExpertiseSection", () => {
  it("attaches skills to their pillar in sort order", () => {
    const pillars: PillarRow[] = [{ id: 1, slug: "throw", sortOrder: 0, word: "Throw", summary: "s", imageSrc: "/i", imageAlt: "a", panel: true, published: true, createdAt: now, updatedAt: now }];
    const skills: SkillRow[] = [
      { id: 2, pillarId: 1, sortOrder: 1, name: "B", detail: "b" },
      { id: 1, pillarId: 1, sortOrder: 0, name: "A", detail: "a" },
      { id: 3, pillarId: 99, sortOrder: 0, name: "X", detail: "x" },
    ];
    const out = toExpertiseSection(copy("expertise", seedSectionCopy.expertise), pillars, skills);
    expect(out.headline).toEqual({ plain: "The complete", accent: "hooker." });
    expect(out.pillars[0].skills.map((s) => s.name)).toEqual(["A", "B"]);
  });
});

describe("toFaqSection", () => {
  it("uses the row id as the item id and keeps the hero image", () => {
    const rows: FaqRow[] = [{ id: 7, sortOrder: 0, question: "Q", answer: "A", published: true, createdAt: now, updatedAt: now }];
    const out = toFaqSection(copy("faq", seedSectionCopy.faq), rows);
    expect(out.items[0].id).toBe("7");
    expect(out.heroImage).toBe("/images/FAQ.jpeg");
  });
});
```

- [ ] **Step 7: Run it** — Expected: FAIL, module not found.

- [ ] **Step 8: Create `src/lib/content/mappers.ts`**

```ts
import type {
  FaqRow, PillarRow, ProgramRow, SectionCopyRow, SiteSettingsRow, SkillRow, TestimonialRow,
} from "@/lib/db/schema";
import { priceLabel } from "./pricing";
import type {
  AccentHeadline, ContactSection, ExpertiseSection, FaqSection, OnlineCopy,
  ProgramsSection, TestimonialsSection,
} from "./types";

export const headlineLines = (text: string): string[] =>
  text.split("\n").map((l) => l.trim()).filter(Boolean);

export const accentHeadline = (copy: SectionCopyRow): AccentHeadline => ({
  plain: copy.headline.trim(),
  accent: copy.headlineAccent?.trim() ?? "",
});

export const programNumber = (index: number) => String(index + 1).padStart(2, "0");

const bySort = <T extends { sortOrder: number; id: number }>(a: T, b: T) =>
  a.sortOrder - b.sortOrder || a.id - b.id;

export function toProgramsSection(copy: SectionCopyRow, rows: ProgramRow[], settings: SiteSettingsRow): ProgramsSection {
  const items = rows.filter((r) => r.published).sort(bySort).map((r, i) => ({
    id: r.slug,
    number: programNumber(i),
    format: r.format,
    title: r.title,
    summary: r.summary,
    listTitle: r.listTitle,
    points: r.points,
    image: { src: r.imageSrc, alt: r.imageAlt },
    priceLabel: priceLabel({
      showPricing: settings.showPricing, showPrice: r.showPrice,
      price: r.price, priceNote: r.priceNote, currency: settings.currency,
    }),
  }));
  return {
    eyebrow: copy.eyebrow,
    headline: headlineLines(copy.headline),
    cta: { label: copy.ctaLabel ?? "Get in touch", href: copy.ctaHref ?? "/#contact" },
    items,
  };
}

export function toExpertiseSection(copy: SectionCopyRow, pillars: PillarRow[], skills: SkillRow[]): ExpertiseSection {
  return {
    eyebrow: copy.eyebrow,
    headline: accentHeadline(copy),
    intro: copy.intro ?? "",
    pillars: pillars.filter((p) => p.published).sort(bySort).map((p) => ({
      id: p.slug,
      image: p.imageSrc,
      alt: p.imageAlt,
      word: p.word,
      summary: p.summary,
      panel: p.panel,
      skills: skills.filter((s) => s.pillarId === p.id).sort(bySort).map((s) => ({ name: s.name, detail: s.detail })),
    })),
  };
}

export function toTestimonialsSection(copy: SectionCopyRow, rows: TestimonialRow[]): TestimonialsSection {
  return {
    eyebrow: copy.eyebrow,
    headline: accentHeadline(copy),
    items: rows.filter((r) => r.published).sort(bySort).map((r) => ({
      id: String(r.id), name: r.name, role: r.role, org: r.org, image: r.imageSrc, quote: r.quote,
    })),
  };
}

export function toFaqSection(copy: SectionCopyRow, rows: FaqRow[]): FaqSection {
  return {
    eyebrow: copy.eyebrow,
    headline: headlineLines(copy.headline),
    intro: copy.intro ?? "",
    heroImage: copy.heroImage ?? "/images/FAQ.jpeg",
    items: rows.filter((r) => r.published).sort(bySort).map((r) => ({
      id: String(r.id), question: r.question, answer: r.answer,
    })),
  };
}

export function toContactSection(copy: SectionCopyRow, settings: SiteSettingsRow): ContactSection {
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
```

- [ ] **Step 9: Run all tests** — `npm test` — Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add src/lib/content/types.ts src/lib/content/pricing.ts src/lib/content/pricing.test.ts src/lib/content/mappers.ts src/lib/content/mappers.test.ts
git commit -m "feat(content): add section types, mappers and pricing rule"
```

### Task 5: Cached readers with production fallback

**Files:**
- Create: `src/lib/content/fallback.ts`, `src/lib/content/queries.ts`
- Test: `src/lib/content/fallback.test.ts`

**Interfaces:**
- Produces: `withFallback(name, read, fallback, onFallback?)`; readers `getProgramsSection()`, `getExpertiseSection()`, `getTestimonialsSection()`, `getFaqSection()`, `getContactSection()`, `getOnlineCopy()`, `getSiteSettings()`; constants `TAGS`.

- [ ] **Step 1: Write the failing fallback test** — `src/lib/content/fallback.test.ts`

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { withFallback } from "@/lib/content/fallback";

describe("withFallback", () => {
  const env = process.env.NODE_ENV;
  afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

  it("returns the read value when it succeeds", async () => {
    await expect(withFallback("x", async () => 1, () => 2)).resolves.toBe(1);
  });

  it("rethrows outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(withFallback("x", async () => { throw new Error("db"); }, () => 2)).rejects.toThrow("db");
  });

  it("logs and returns the fallback in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const onFallback = vi.fn();
    await expect(withFallback("x", async () => { throw new Error("db"); }, () => 2, onFallback)).resolves.toBe(2);
    expect(err).toHaveBeenCalledOnce();
    expect(onFallback).toHaveBeenCalledOnce();
    expect(env).toBeDefined();
  });
});
```

- [ ] **Step 2: Run it** — Expected: FAIL, module not found.

- [ ] **Step 3: Create `src/lib/content/fallback.ts`**

```ts
import { seedFaqs, seedPillars, seedPrograms, seedSectionCopy, seedSettings, seedTestimonials } from "./seed-data";
import {
  toContactSection, toExpertiseSection, toFaqSection, toOnlineCopy, toProgramsSection, toTestimonialsSection,
} from "./mappers";
import type { SectionKey } from "@/lib/db/schema";

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
const copyRow = (key: SectionKey) => ({ key, ...seedSectionCopy[key], updatedAt: now });
const settingsRow = { ...seedSettings, updatedAt: now };
const withIds = <T>(rows: T[]) => rows.map((r, i) => ({ id: i + 1, createdAt: now, updatedAt: now, ...r }));

export const staticPrograms = () => toProgramsSection(copyRow("programs"), withIds(seedPrograms), settingsRow);
export const staticExpertise = () => {
  const pillars = withIds(seedPillars.map(({ skills: _s, ...p }) => p));
  const skills = seedPillars.flatMap((p, pi) => p.skills.map((s, si) => ({ id: pi * 100 + si, pillarId: pi + 1, ...s })));
  return toExpertiseSection(copyRow("expertise"), pillars, skills);
};
export const staticTestimonials = () => toTestimonialsSection(copyRow("testimonials"), withIds(seedTestimonials));
export const staticFaq = () => toFaqSection(copyRow("faq"), withIds(seedFaqs));
export const staticContact = () => toContactSection(copyRow("contact"), settingsRow);
export const staticOnline = () => toOnlineCopy(copyRow("online"));
export const staticSettings = () => ({ contactEmail: settingsRow.contactEmail });
```

- [ ] **Step 4: Run it** — Expected: 3 passed.

- [ ] **Step 5: Create `src/lib/content/queries.ts`**

```ts
import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { getDb } from "@/lib/db/client";
import {
  expertisePillars, expertiseSkills, faqs, programs, sectionCopy, siteSettings, testimonials,
  type SectionKey,
} from "@/lib/db/schema";
import {
  staticContact, staticExpertise, staticFaq, staticOnline, staticPrograms, staticSettings, staticTestimonials, withFallback,
} from "./fallback";
import {
  toContactSection, toExpertiseSection, toFaqSection, toOnlineCopy, toProgramsSection, toTestimonialsSection,
} from "./mappers";
import type {
  ContactSection, ExpertiseSection, FaqSection, OnlineCopy, ProgramsSection, PublicSettings, TestimonialsSection,
} from "./types";

export const TAGS = {
  programs: "content:programs",
  expertise: "content:expertise",
  testimonials: "content:testimonials",
  faqs: "content:faqs",
  sections: "content:sections",
  settings: "content:settings",
} as const;

async function copyFor(key: SectionKey) {
  const [row] = await getDb().select().from(sectionCopy).where(eq(sectionCopy.key, key));
  if (!row) throw new Error(`section_copy.${key} missing; run npm run db:seed`);
  return row;
}

async function settingsRow() {
  const [row] = await getDb().select().from(siteSettings).where(eq(siteSettings.id, 1));
  if (!row) throw new Error("site_settings missing; run npm run db:seed");
  return row;
}

/* A failed read is cached briefly so the next visit retries the database. */
const retrySoon = () => cacheLife("minutes");

export async function getProgramsSection(): Promise<ProgramsSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.programs, TAGS.sections, TAGS.settings);
  return withFallback("programs", async () => {
    const db = getDb();
    const rows = await db.select().from(programs).orderBy(asc(programs.sortOrder), asc(programs.id));
    return toProgramsSection(await copyFor("programs"), rows, await settingsRow());
  }, staticPrograms, retrySoon);
}

export async function getExpertiseSection(): Promise<ExpertiseSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.expertise, TAGS.sections);
  return withFallback("expertise", async () => {
    const db = getDb();
    const pillars = await db.select().from(expertisePillars).orderBy(asc(expertisePillars.sortOrder), asc(expertisePillars.id));
    const skills = await db.select().from(expertiseSkills).orderBy(asc(expertiseSkills.sortOrder), asc(expertiseSkills.id));
    return toExpertiseSection(await copyFor("expertise"), pillars, skills);
  }, staticExpertise, retrySoon);
}

export async function getTestimonialsSection(): Promise<TestimonialsSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.testimonials, TAGS.sections);
  return withFallback("testimonials", async () => {
    const rows = await getDb().select().from(testimonials).orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
    return toTestimonialsSection(await copyFor("testimonials"), rows);
  }, staticTestimonials, retrySoon);
}

export async function getFaqSection(): Promise<FaqSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.faqs, TAGS.sections);
  return withFallback("faq", async () => {
    const rows = await getDb().select().from(faqs).orderBy(asc(faqs.sortOrder), asc(faqs.id));
    return toFaqSection(await copyFor("faq"), rows);
  }, staticFaq, retrySoon);
}

export async function getContactSection(): Promise<ContactSection> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.sections, TAGS.settings);
  return withFallback("contact", async () => toContactSection(await copyFor("contact"), await settingsRow()), staticContact, retrySoon);
}

export async function getOnlineCopy(): Promise<OnlineCopy> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.sections);
  return withFallback("online", async () => toOnlineCopy(await copyFor("online")), staticOnline, retrySoon);
}

export async function getSiteSettings(): Promise<PublicSettings> {
  "use cache";
  cacheLife("max");
  cacheTag(TAGS.settings);
  return withFallback("settings", async () => ({ contactEmail: (await settingsRow()).contactEmail }), staticSettings, retrySoon);
}
```

If `cacheLife("minutes")` inside `retrySoon` throws at runtime because it is called outside the directive's direct body, remove the `retrySoon` argument from the calls and leave `onFallback` unused; the behaviour then matches the spec's documented limitation (fallback cached until the next admin save).

- [ ] **Step 6: Type-check** — `npx tsc --noEmit` — Expected: no errors in `src/lib/**`.

- [ ] **Step 7: Commit**

```bash
git add src/lib/content/fallback.ts src/lib/content/fallback.test.ts src/lib/content/queries.ts
git commit -m "feat(content): add cached readers with production fallback"
```

### Task 6: Route group, layouts, Navbar and Footer props

**Files:**
- Create: `src/app/(site)/layout.tsx`
- Move: `src/app/page.tsx`, `src/app/faq/`, `src/app/privacy-policy/`, `src/app/terms-and-conditions/`, `src/app/refund-and-cancellation/` into `src/app/(site)/`
- Modify: `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/lib/site.ts`, `src/data/nav.ts`, `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`, `src/app/robots.ts`

**Interfaces:**
- Produces: `Navbar({ contactEmail })`, `Footer({ contactEmail })`; `SITE_NAME`, `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION` exported from `src/lib/site.ts`; `brand` (tagline only) replaces `contact` in `src/data/nav.ts`.

- [ ] **Step 1: Move the public routes**

```bash
mkdir -p "src/app/(site)"
git mv src/app/page.tsx "src/app/(site)/page.tsx"
git mv src/app/faq "src/app/(site)/faq"
git mv src/app/privacy-policy "src/app/(site)/privacy-policy"
git mv src/app/terms-and-conditions "src/app/(site)/terms-and-conditions"
git mv src/app/refund-and-cancellation "src/app/(site)/refund-and-cancellation"
```

- [ ] **Step 2: Export site constants from `src/lib/site.ts`** (append)

```ts
export const SITE_NAME = "The Hooker Lab";
export const DEFAULT_TITLE = "The Hooker Lab | Specialist Rugby Hooker Coaching in New Zealand";
export const DEFAULT_DESCRIPTION =
  "Specialist rugby hooker coaching in New Zealand with professional hooker Kurt Eklund. Throwing, lineout, scrummaging, mental skills and leadership for players, schools, clubs and unions.";
```

- [ ] **Step 3: Slim `src/app/layout.tsx`**

Keep the font setup, `metadata` and `viewport` exactly as they are but import `SITE_NAME`, `DEFAULT_TITLE`, `DEFAULT_DESCRIPTION`, `SITE_URL` from `@/lib/site` instead of defining them. Delete the `jsonLd` constant and the `Navbar`/`Footer` imports. The body becomes:

```tsx
<html lang="en-NZ" className={`${jost.variable} ${bigShoulders.variable}`}>
  <body className="bg-ink text-bone antialiased">{children}</body>
</html>
```

- [ ] **Step 4: Create `src/app/(site)/layout.tsx`**

```tsx
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getSiteSettings } from "@/lib/content/queries";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

function organisationJsonLd(email: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo/logo.png`,
        email,
        slogan: "Throw. Scrum. Lead.",
        description: DEFAULT_DESCRIPTION,
        areaServed: { "@type": "Country", name: "New Zealand" },
        founder: { "@id": `${SITE_URL}/#kurt` },
        sameAs: ["https://www.instagram.com/kurteklund05/"],
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#kurt`,
        name: "Kurt Eklund",
        jobTitle: "Professional Rugby Hooker and Specialist Hooker Coach",
        worksFor: { "@id": `${SITE_URL}/#organization` },
        sameAs: ["https://www.instagram.com/kurteklund05/"],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-NZ",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { contactEmail } = await getSiteSettings();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd(contactEmail)) }}
      />
      <Navbar contactEmail={contactEmail} />
      <main id="main">{children}</main>
      <Footer contactEmail={contactEmail} />
    </>
  );
}
```

- [ ] **Step 5: Update `src/data/nav.ts`** — replace the `contact` export with:

```ts
export const brand = { tagline: "Throw. Scrum. Lead." } as const;
```

- [ ] **Step 6: Update `Navbar.tsx`** — import `brand` instead of `contact`; add a prop:

```tsx
export default function Navbar({ contactEmail }: { contactEmail: string }) {
```

Replace the two `contact.email` uses (lines ~287 and ~290) with `contactEmail` and `contact.tagline` (line ~313) with `brand.tagline`.

- [ ] **Step 7: Update `Footer.tsx`** — same: import without `contact`, add `{ contactEmail }: { contactEmail: string }` prop, replace the three `contact.email` uses.

- [ ] **Step 8: Update `src/app/not-found.tsx`** so the 404 keeps the public chrome

```tsx
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import NotFound from "@/components/sections/NotFound";
import { getSiteSettings } from "@/lib/content/queries";

export default async function NotFoundPage() {
  const { contactEmail } = await getSiteSettings();
  return (
    <>
      <Navbar contactEmail={contactEmail} />
      <main id="main"><NotFound /></main>
      <Footer contactEmail={contactEmail} />
    </>
  );
}
```

(Read the current `not-found.tsx` first and keep whatever metadata it exports.)

- [ ] **Step 9: Disallow admin and API in `src/app/robots.ts`** — add `disallow: ["/admin", "/api"]` to the rules entry (read the file; keep its existing shape).

- [ ] **Step 10: Run the dev server and check** — `npm run dev`, open `/`, `/faq`, `/privacy-policy`, `/nothing-here`. Expected: pages render as before with navbar and footer; the email in the footer still reads `admin@thehookerlab.co.nz`. Then `npx tsc --noEmit` — Expected: clean.

- [ ] **Step 11: Commit**

```bash
git add -A src/app src/lib/site.ts src/data/nav.ts src/components/layout
git commit -m "refactor(app): move public routes into (site) group and pass contact email from settings"
```

### Task 7: Section components take data props; pages read from the database

**Files:**
- Modify: `src/components/sections/Services.tsx`, `Expertise.tsx`, `Testimonials.tsx`, `FAQ.tsx`, `Contact.tsx`, `src/app/(site)/page.tsx`, `src/app/(site)/faq/page.tsx`, `next.config.ts`

**Interfaces:**
- Produces: `Services({ data, online })`, `Expertise({ data })`, `Testimonials({ data })`, `FAQ({ data })`, `Contact({ data })` with the `*Section` types from Task 4.

- [ ] **Step 1: `Services.tsx`**

- Remove `import { services } from "@/data/services"` and `type Service = (typeof services.items)[number]`.
- Add `import type { OnlineCopy, ProgramItem, ProgramsSection } from "@/lib/content/types"; import { useState } from "react"; import RegistrationDialog from "@/components/ui/RegistrationDialog";`
- `ServiceCard` takes `{ item, cta }: { item: ProgramItem; cta: ProgramsSection["cta"] }` and uses `cta.href` / `cta.label` where it used `services.cta.*`.
- Under the summary paragraph add the price line:

```tsx
{item.priceLabel && (
  <p data-svc-fade className="mt-3 font-display text-2xl uppercase tracking-wide text-ink">
    {item.priceLabel}
  </p>
)}
```

- The default export becomes:

```tsx
export default function Services({ data, online }: { data: ProgramsSection; online: OnlineCopy }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const jsonLd = { ...same object as before but built from data.items... };
  // useGSAP block unchanged
```

Replace `services.eyebrow`, `services.headline`, `services.items` with `data.*`, pass `cta={data.cta}` to each card, and after the `</ul>` add:

```tsx
<div className="mt-10 flex justify-center">
  <button
    type="button"
    onClick={() => setRegisterOpen(true)}
    className="rounded-full border border-ink px-6 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-ink hover:text-bone"
  >
    {online.ctaLabel}
  </button>
</div>
<RegistrationDialog open={registerOpen} onClose={() => setRegisterOpen(false)} />
```

Move the `jsonLd` constant inside the component because it now depends on props.

- [ ] **Step 2: `Expertise.tsx`** — remove the data import, add `import type { ExpertiseSection } from "@/lib/content/types"`, signature `Expertise({ data }: { data: ExpertiseSection })`, and replace `expertise.` with `data.` (the `pillars` local, `eyebrow`, `headline.plain/accent`, `intro`). The `useState` initialiser that maps over pillars keeps working.

- [ ] **Step 3: `Testimonials.tsx`** — remove the data import, add `import type { TestimonialItem, TestimonialsSection } from "@/lib/content/types"`, replace `type Testimonial = (typeof items)[number]` with `type Testimonial = TestimonialItem`, signature `Testimonials({ data }: { data: TestimonialsSection })`, and derive `const items = data.items` inside the component (move any module-level use of `items` inside).

- [ ] **Step 4: `FAQ.tsx`** — same pattern with `FaqSection`; `faq.items`, `faq.eyebrow`, `faq.headline`, `faq.intro`, `faq.heroImage` become `data.*`.

- [ ] **Step 5: `Contact.tsx`** — keep `import { contact } from "@/data/contact"` for the form labels and option lists. Add `import type { ContactSection } from "@/lib/content/types"`, signature `Contact({ data }: { data: ContactSection })`, and replace exactly these: `contact.eyebrow` → `data.eyebrow`, `contact.headline.map` → `data.headline.map`, `contact.intro` → `data.intro`, and every `contact.email` → `data.email` (lines ~263, 266, 723, 726). `contact.emailNote` stays.

- [ ] **Step 6: `src/app/(site)/page.tsx`**

```tsx
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import Expertise from "@/components/sections/Expertise";
import Hero from "@/components/sections/Hero";
import Instagram from "@/components/sections/Instagram";
import Philosophy from "@/components/sections/Philosophy";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";
import {
  getContactSection, getExpertiseSection, getFaqSection, getOnlineCopy, getProgramsSection, getTestimonialsSection,
} from "@/lib/content/queries";

export default async function Home() {
  const [programs, online, expertise, contact, testimonials] = await Promise.all([
    getProgramsSection(), getOnlineCopy(), getExpertiseSection(), getContactSection(), getTestimonialsSection(),
  ]);
  return (
    <>
      <Hero />
      <Philosophy />
      <Services data={programs} online={online} />
      <Expertise data={expertise} />
      <About />
      <Contact data={contact} />
      <Testimonials data={testimonials} />
      <Instagram />
    </>
  );
}
```

(Remove the unused `getFaqSection` import.)

- [ ] **Step 7: `src/app/(site)/faq/page.tsx`** — make it `async`, `const data = await getFaqSection()`, build `jsonLd` from `data.items`, render `<FAQ data={data} />`. Keep `metadata`.

- [ ] **Step 8: `next.config.ts`** — replace the pravatar pattern with `{ protocol: "https", hostname: "**" }`.

- [ ] **Step 9: Verify** — `npx tsc --noEmit` clean; `npm run dev`; the home page and `/faq` look identical to before; no price shows (both switches are off). Open the Neon table `programs`, set one row's `show_price=true`, `price=150`, and `site_settings.show_pricing=true` (Drizzle Studio: `npm run db:studio`); nothing changes yet because the cache has not been invalidated — restart `npm run dev` to confirm `$150` now renders under that card. Reset both flags to false afterwards.

- [ ] **Step 10: Commit**

```bash
git add -A src/components/sections "src/app/(site)" next.config.ts
git commit -m "feat(site): render sections from database content"
```

## Phase 3 — Auth and admin shell

### Task 8: Session, data access layer, proxy, login and logout

**Files:**
- Create: `src/lib/auth/session.ts`, `src/lib/auth/dal.ts`, `src/proxy.ts`, `src/lib/admin/form.ts`, `src/lib/admin/actions/auth.ts`, `src/components/admin/LoginForm.tsx`, `src/app/admin/(auth)/login/page.tsx`
- Test: `src/lib/admin/form.test.ts`

**Interfaces:**
- Produces: `getSession()`, `SessionData = { userId?: number }`; `getCurrentAdmin(): Promise<AdminUser | null>`, `requireAdmin(): Promise<AdminUser>` with `AdminUser = { id: number; email: string; name: string }`; `ActionState`, `initialState`, `zodErrors(err)`, `fail(errors, message?)`, `ok(message?)`; actions `login(prev, formData)`, `logout()`.

- [ ] **Step 1: Write the failing form helper test** — `src/lib/admin/form.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { checkbox, jsonList, zodErrors } from "@/lib/admin/form";

describe("zodErrors", () => {
  it("keeps the first message per field, keyed by path", () => {
    const schema = z.object({ title: z.string().min(2, "Too short"), nested: z.object({ a: z.string() }) });
    const result = schema.safeParse({ title: "", nested: {} });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = zodErrors(result.error);
      expect(errors.title).toBe("Too short");
      expect(errors["nested.a"]).toBeTypeOf("string");
    }
  });
});

describe("checkbox", () => {
  it("treats 'on' and 'true' as true and anything else as false", () => {
    expect(checkbox.parse("on")).toBe(true);
    expect(checkbox.parse("true")).toBe(true);
    expect(checkbox.parse(undefined)).toBe(false);
    expect(checkbox.parse("")).toBe(false);
  });
});

describe("jsonList", () => {
  it("parses a JSON array of trimmed non-empty strings", () => {
    expect(jsonList.parse('["a ", " b"]')).toEqual(["a", "b"]);
  });
  it("drops empty entries", () => {
    expect(jsonList.parse('["a", "  ", ""]')).toEqual(["a"]);
  });
  it("rejects invalid JSON", () => {
    expect(jsonList.safeParse("nope").success).toBe(false);
  });
});
```

- [ ] **Step 2: Run it** — Expected: FAIL, module not found.

- [ ] **Step 3: Create `src/lib/admin/form.ts`**

```ts
import { z, type ZodError } from "zod";

export type ActionState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; errors: Record<string, string>; message?: string };

export const initialState: ActionState = { status: "idle" };

export const ok = (message?: string): ActionState => ({ status: "success", message });
export const fail = (errors: Record<string, string>, message?: string): ActionState => ({
  status: "error",
  errors,
  message,
});

export function zodErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

export const checkbox = z.preprocess((v) => v === "on" || v === "true", z.boolean());

export const jsonList = z
  .string()
  .transform((raw, ctx) => {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error();
      return parsed.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid list" });
      return z.NEVER;
    }
  });

/* FormData -> plain object. Repeated keys keep the first value; checkboxes arrive as "on". */
export function formObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && !(k in out)) out[k] = v;
  }
  return out;
}
```

- [ ] **Step 4: Run it** — Expected: 5 passed.

- [ ] **Step 5: Create `src/lib/auth/session.ts`**

```ts
import "server-only";
import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = { userId?: number };

export const SESSION_COOKIE = "thl_admin";

function options(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) throw new Error("SESSION_SECRET must be set and at least 32 characters");
  return {
    password,
    cookieName: SESSION_COOKIE,
    ttl: 60 * 60 * 24 * 7,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), options());
}
```

Install `server-only` if it is not already present: `npm install server-only`.

- [ ] **Step 6: Create `src/lib/auth/dal.ts`**

```ts
import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { getSession } from "./session";

export type AdminUser = { id: number; email: string; name: string };

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  if (!session.userId) return null;
  const [user] = await getDb()
    .select({ id: adminUsers.id, email: adminUsers.email, name: adminUsers.name })
    .from(adminUsers)
    .where(eq(adminUsers.id, session.userId));
  return user ?? null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}
```

- [ ] **Step 7: Create `src/proxy.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "thl_admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !request.cookies.has(COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
```

- [ ] **Step 8: Create `src/lib/admin/actions/auth.ts`**

```ts
"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { fail, formObject, type ActionState } from "@/lib/admin/form";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail({}, "Enter your email and password.");

  const [user] = await getDb().select().from(adminUsers).where(eq(adminUsers.email, parsed.data.email));
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;
  if (!user || !valid) {
    await sleep(500);
    return fail({}, "Email or password is incorrect.");
  }

  const session = await getSession();
  session.userId = user.id;
  await session.save();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const session = await getSession();
  session.destroy();
  redirect("/admin/login");
}
```

- [ ] **Step 9: Create `src/components/admin/LoginForm.tsx`**

```tsx
"use client";

import { useActionState } from "react";

import { initialState } from "@/lib/admin/form";
import { login } from "@/lib/admin/actions/auth";

const input =
  "w-full rounded-xl border border-line bg-steel px-4 py-3 text-bone placeholder:text-mist/60 focus:border-bone focus:outline-none";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-bone">
          {state.message}
        </p>
      )}
      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em] text-mist">Email</span>
        <input name="email" type="email" autoComplete="username" required className={input} />
      </label>
      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em] text-mist">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className={input} />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-accent-deep disabled:opacity-60"
      >
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
```

- [ ] **Step 10: Create `src/app/admin/(auth)/login/page.tsx`**

```tsx
import type { Metadata } from "next";
import Image from "next/image";

import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <div className="w-full max-w-sm rounded-[1.75rem] border border-line bg-coal p-8">
        <Image src="/logo/logo.png" alt="The Hooker Lab" width={56} height={56} className="mb-6" />
        <h1 className="font-display text-3xl">Admin</h1>
        <p className="mt-2 text-sm text-mist">Sign in to edit the site.</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
```

(Check `public/logo/` for the actual logo file name and use it.)

- [ ] **Step 11: Verify** — `npm run dev`; visit `/admin` → redirected to `/admin/login`; wrong password → error after a short delay; right password → redirect to `/admin` (404 for now, that is expected). `npx tsc --noEmit` clean.

- [ ] **Step 12: Commit**

```bash
git add src/lib/auth src/lib/admin src/proxy.ts src/components/admin/LoginForm.tsx "src/app/admin/(auth)" package.json package-lock.json
git commit -m "feat(admin): add session auth, proxy guard and login"
```

### Task 9: Admin shell, panel layout, dashboard, loading, error, toast

**Files:**
- Create: `src/components/admin/Shell.tsx`, `src/components/admin/PageHeader.tsx`, `src/components/admin/Toast.tsx`, `src/components/admin/StatusBadge.tsx`, `src/app/admin/(panel)/layout.tsx`, `src/app/admin/(panel)/loading.tsx`, `src/app/admin/(panel)/error.tsx`, `src/app/admin/(panel)/page.tsx`

**Interfaces:**
- Produces: `Shell({ user, children })`, `PageHeader({ title, description?, action? })`, `Toast` (reads `?saved=1`), `StatusBadge({ status })`, `ADMIN_NAV` list.

- [ ] **Step 1: Create `src/components/admin/Shell.tsx`** (client, for the mobile drawer)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChatCircleText, Gauge, GraduationCap, List, Quotes, Question, SignOut, SlidersHorizontal,
  Stack, TextAa, UserCircle, UsersThree, X,
} from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { logout } from "@/lib/admin/actions/auth";
import type { AdminUser } from "@/lib/auth/dal";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/programmes", label: "Programmes", icon: Stack },
  { href: "/admin/expertise", label: "Expertise", icon: GraduationCap },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quotes },
  { href: "/admin/faq", label: "FAQ", icon: Question },
  { href: "/admin/sections", label: "Section copy", icon: TextAa },
  { href: "/admin/enquiries", label: "Enquiries", icon: ChatCircleText },
  { href: "/admin/registrations", label: "Registrations", icon: UsersThree },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal },
  { href: "/admin/account", label: "Account", icon: UserCircle },
] as const;

export default function Shell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            isActive(href) ? "bg-steel text-bone" : "text-mist hover:bg-steel/60 hover:text-bone",
          )}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="mt-auto border-t border-line pt-4">
      <p className="truncate text-sm text-bone">{user.name}</p>
      <p className="truncate text-xs text-mist">{user.email}</p>
      <form action={logout} className="mt-3">
        <button type="submit" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-mist hover:text-bone">
          <SignOut size={16} /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink text-bone">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
        <Link href="/admin" className="font-display text-xl uppercase">The Hooker Lab</Link>
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)}><List size={24} /></button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-72 flex-col bg-coal p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl uppercase">Admin</span>
              <button type="button" aria-label="Close menu" onClick={() => setOpen(false)}><X size={22} /></button>
            </div>
            {nav}
            {footer}
          </div>
          <button type="button" aria-label="Close menu" className="flex-1 bg-ink/70" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden min-h-screen flex-col border-r border-line bg-coal p-5 lg:flex">
          <Link href="/admin" className="mb-8 font-display text-2xl uppercase">The Hooker Lab</Link>
          {nav}
          {footer}
        </aside>
        <div className="min-w-0 px-5 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}
```

Check each icon name exists in `@phosphor-icons/react`; swap any missing one for `Circle`.

- [ ] **Step 2: Create `src/components/admin/PageHeader.tsx`**

```tsx
import Link from "next/link";

export default function PageHeader({
  title, description, action,
}: { title: string; description?: string; action?: { label: string; href: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-xl text-sm text-mist">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="rounded-full bg-accent px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.2em] text-bone hover:bg-accent-deep"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/admin/Toast.tsx`**

```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Toast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const saved = params.get("saved");

  useEffect(() => {
    if (!saved) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      router.replace(pathname, { scroll: false });
    }, 3000);
    return () => clearTimeout(t);
  }, [saved, pathname, router]);

  if (!visible) return null;
  return (
    <div role="status" className="fixed bottom-6 right-6 z-50 rounded-xl border border-line bg-steel px-5 py-3 text-sm text-bone shadow-lg">
      {saved === "deleted" ? "Deleted." : "Saved."}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/admin/StatusBadge.tsx`**

```tsx
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  new: "bg-accent/15 text-accent border-accent/40",
  read: "bg-steel text-bone border-line",
  archived: "bg-coal text-mist border-line",
  published: "bg-steel text-bone border-line",
  hidden: "bg-coal text-mist border-line",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em]", styles[status] ?? styles.read)}>
      {status}
    </span>
  );
}
```

- [ ] **Step 5: Create `src/app/admin/(panel)/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import Shell from "@/components/admin/Shell";
import Toast from "@/components/admin/Toast";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = { robots: { index: false, follow: false } };

async function Panel({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <Shell user={user}>{children}</Shell>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <Panel>{children}</Panel>
      <Suspense fallback={null}>
        <Toast />
      </Suspense>
    </Suspense>
  );
}
```

- [ ] **Step 6: Create `loading.tsx` and `error.tsx`** in `src/app/admin/(panel)/`

```tsx
// loading.tsx
export default function Loading() {
  return <p className="text-sm text-mist">Loading…</p>;
}
```

```tsx
// error.tsx
"use client";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-[1.25rem] border border-accent/40 bg-accent/10 p-6">
      <h2 className="font-display text-2xl">Something went wrong</h2>
      <p className="mt-2 text-sm text-mist">{error.message}</p>
      <button type="button" onClick={reset} className="mt-4 rounded-full border border-bone px-5 py-2 text-xs uppercase tracking-[0.2em]">
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Create the dashboard `src/app/admin/(panel)/page.tsx`**

```tsx
import Link from "next/link";
import { count, desc, eq } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { getDb } from "@/lib/db/client";
import { enquiries, registrations } from "@/lib/db/schema";

export default async function Dashboard() {
  const db = getDb();
  const [[newEnq], [newReg], latestEnq, latestReg] = await Promise.all([
    db.select({ n: count() }).from(enquiries).where(eq(enquiries.status, "new")),
    db.select({ n: count() }).from(registrations).where(eq(registrations.status, "new")),
    db.select().from(enquiries).orderBy(desc(enquiries.id)).limit(5),
    db.select().from(registrations).orderBy(desc(registrations.id)).limit(5),
  ]);

  const card = "rounded-[1.25rem] border border-line bg-coal p-6";
  return (
    <>
      <PageHeader title="Dashboard" description="What needs your attention." />
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/admin/enquiries" className={card}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">New enquiries</p>
          <p className="mt-2 font-display text-5xl">{Number(newEnq.n)}</p>
        </Link>
        <Link href="/admin/registrations" className={card}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">New registrations</p>
          <p className="mt-2 font-display text-5xl">{Number(newReg.n)}</p>
        </Link>
        <div className={card}>
          <h2 className="font-display text-2xl">Latest enquiries</h2>
          <ul className="mt-4 divide-y divide-line">
            {latestEnq.length === 0 && <li className="py-3 text-sm text-mist">Nothing yet.</li>}
            {latestEnq.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <Link href={`/admin/enquiries/${e.id}`} className="truncate hover:underline">{e.name} · {e.enquiryType}</Link>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        </div>
        <div className={card}>
          <h2 className="font-display text-2xl">Latest registrations</h2>
          <ul className="mt-4 divide-y divide-line">
            {latestReg.length === 0 && <li className="py-3 text-sm text-mist">Nothing yet.</li>}
            {latestReg.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <Link href={`/admin/registrations/${r.id}`} className="truncate hover:underline">{r.name} · {r.level}</Link>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 8: Verify** — log in, see the dashboard with two zero counts, sidebar links (404 for now), sign out returns to login. Mobile width shows the drawer. `npx tsc --noEmit` clean.

- [ ] **Step 9: Commit**

```bash
git add src/components/admin "src/app/admin/(panel)"
git commit -m "feat(admin): add shell, dashboard, loading, error and toast"
```

## Phase 4 — Admin CRUD

### Task 10: Form infrastructure: schemas, slug, reorder, field primitives, ResourceForm, RowControls

**Files:**
- Create: `src/lib/admin/schemas.ts`, `src/lib/admin/slug.ts`, `src/lib/admin/reorder.ts`, `src/lib/admin/fields.ts`, `src/components/admin/fields.tsx`, `src/components/admin/ListEditor.tsx`, `src/components/admin/PairListEditor.tsx`, `src/components/admin/SubmitButton.tsx`, `src/components/admin/ResourceForm.tsx`, `src/components/admin/ConfirmDialog.tsx`, `src/components/admin/RowControls.tsx`, `src/components/admin/ResourceList.tsx`
- Test: `src/lib/admin/schemas.test.ts`, `src/lib/admin/slug.test.ts`, `src/lib/admin/reorder.test.ts`

**Interfaces:**
- Produces: zod schemas `programSchema`, `pillarSchema`, `testimonialSchema`, `faqSchema`, `sectionSchema`, `settingsSchema`, `accountSchema`, `passwordSchema`, `notesSchema`, `statusSchema`; `slugify(text)`, `uniqueSlug(base, taken: string[])`; `reorderIds(ids, id, direction)`; `FieldDef` union; components `ResourceForm({ action, fields, initial, submitLabel, cancelHref })`, `RowControls({ id, published, isFirst, isLast, onMove, onToggle, onDelete })`, `ResourceList({ rows, columns, controls })`.

- [ ] **Step 1: Write the failing schema tests** — `src/lib/admin/schemas.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { accountSchema, faqSchema, passwordSchema, pillarSchema, programSchema, settingsSchema } from "@/lib/admin/schemas";

const validProgram = {
  title: "Individual Hooker Coaching", slug: "", format: "One-on-one", summary: "Summary", listTitle: "At a glance",
  points: '["a","b"]', imageSrc: "/images/x.jpg", imageAlt: "alt", price: "", priceNote: "", showPrice: undefined, published: "on",
};

describe("programSchema", () => {
  it("accepts a valid programme with no price", () => {
    const r = programSchema.safeParse(validProgram);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.price).toBeNull();
      expect(r.data.showPrice).toBe(false);
      expect(r.data.published).toBe(true);
      expect(r.data.points).toEqual(["a", "b"]);
    }
  });
  it("accepts a decimal price and normalises it", () => {
    const r = programSchema.safeParse({ ...validProgram, price: "149.5" });
    expect(r.success && r.data.price).toBe("149.50");
  });
  it("rejects a price with symbols or thousands separators", () => {
    for (const bad of ["$1,200", "150 NZD", "abc", "-5"]) {
      const r = programSchema.safeParse({ ...validProgram, price: bad });
      expect(r.success, bad).toBe(false);
      if (!r.success) expect(r.error.issues[0].path).toEqual(["price"]);
    }
  });
  it("requires at least one point", () => {
    expect(programSchema.safeParse({ ...validProgram, points: "[]" }).success).toBe(false);
  });
  it("rejects a slug with spaces or capitals", () => {
    expect(programSchema.safeParse({ ...validProgram, slug: "Has Space" }).success).toBe(false);
  });
});

describe("pillarSchema", () => {
  it("parses skills as name/detail pairs", () => {
    const r = pillarSchema.safeParse({
      word: "Throw", slug: "", summary: "s", imageSrc: "/i", imageAlt: "a", panel: "on", published: "on",
      skills: '[{"name":"A","detail":"a"},{"name":" ","detail":""}]',
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.skills).toEqual([{ name: "A", detail: "a" }]);
  });
});

describe("faqSchema", () => {
  it("requires question and answer", () => {
    const r = faqSchema.safeParse({ question: "", answer: "", published: "on" });
    expect(r.success).toBe(false);
  });
});

describe("settingsSchema", () => {
  it("uppercases the currency and validates emails", () => {
    const r = settingsSchema.safeParse({
      contactEmail: "A@B.co", notificationEmail: "a@b.co", fromEmail: "noreply@b.co", fromName: "X", showPricing: "on", currency: "nzd",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.currency).toBe("NZD");
      expect(r.data.contactEmail).toBe("a@b.co");
      expect(r.data.showPricing).toBe(true);
    }
  });
});

describe("accountSchema and passwordSchema", () => {
  it("lowercases and trims the email", () => {
    const r = accountSchema.safeParse({ name: "Kurt", email: "  Kurt@Example.com " });
    expect(r.success && r.data.email).toBe("kurt@example.com");
  });
  it("requires the new password to match its confirmation and be 10+ chars", () => {
    expect(passwordSchema.safeParse({ currentPassword: "x", newPassword: "short", confirmPassword: "short" }).success).toBe(false);
    const r = passwordSchema.safeParse({ currentPassword: "x", newPassword: "longenough1", confirmPassword: "different1" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["confirmPassword"]);
    expect(passwordSchema.safeParse({ currentPassword: "x", newPassword: "longenough1", confirmPassword: "longenough1" }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run it** — Expected: FAIL, module not found.

- [ ] **Step 3: Create `src/lib/admin/schemas.ts`**

```ts
import { z } from "zod";

import { INBOX_STATUSES, SECTION_KEYS } from "@/lib/db/schema";
import { checkbox, jsonList } from "./form";

const str = (max: number, label = "This field") =>
  z.string().trim().min(1, `${label} is required`).max(max, `Keep it under ${max} characters`);
const optional = (max: number) => z.string().trim().max(max, `Keep it under ${max} characters`);
const email = z.string().trim().toLowerCase().email("Enter a valid email address");

export const slugField = z
  .string()
  .trim()
  .max(120)
  .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes only");

export const priceField = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    if (!/^\d+(\.\d{1,2})?$/.test(v)) {
      ctx.addIssue({ code: "custom", message: "Enter a number like 150 or 149.50, with no symbols" });
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
  points: jsonList.pipe(z.array(z.string().max(120)).min(1, "Add at least one point").max(8, "At most 8 points")),
  imageSrc: str(500, "Image"),
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
      if (!Array.isArray(parsed)) throw new Error();
      return parsed
        .map((p) => ({ name: String((p as { name?: unknown }).name ?? "").trim(), detail: String((p as { detail?: unknown }).detail ?? "").trim() }))
        .filter((p) => p.name || p.detail);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid list" });
      return z.NEVER;
    }
  })
  .pipe(
    z.array(z.object({ name: str(80, "Skill name"), detail: str(200, "Skill detail") }))
      .min(1, "Add at least one skill").max(8, "At most 8 skills"),
  );

export const pillarSchema = z.object({
  word: str(40, "Word"),
  slug: slugField,
  summary: str(300, "Summary"),
  imageSrc: str(500, "Image"),
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
  imageSrc: str(500, "Image"),
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
  heroImage: optional(500),
});
export type SectionInput = z.infer<typeof sectionSchema>;

export const settingsSchema = z.object({
  contactEmail: email,
  notificationEmail: email,
  fromEmail: email,
  fromName: str(80, "Sender name"),
  showPricing: checkbox,
  currency: z.string().trim().length(3, "Use a 3-letter currency code").toUpperCase(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

export const accountSchema = z.object({ name: str(80, "Name"), email });

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(10, "Use at least 10 characters").max(200),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const notesSchema = z.object({ notes: optional(2000) });
export const statusSchema = z.enum(INBOX_STATUSES);
```

- [ ] **Step 4: Run it** — Expected: all schema tests pass.

- [ ] **Step 5: Write the failing slug and reorder tests**

`src/lib/admin/slug.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { slugify, uniqueSlug } from "@/lib/admin/slug";

describe("slugify", () => {
  it("lowercases, strips punctuation and collapses spaces", () => {
    expect(slugify("School & Club Coaching!")).toBe("school-club-coaching");
  });
  it("trims leading and trailing dashes", () => {
    expect(slugify("  --Throw-- ")).toBe("throw");
  });
  it("falls back to 'item' for empty input", () => {
    expect(slugify("!!!")).toBe("item");
  });
});

describe("uniqueSlug", () => {
  it("returns the base when free", () => {
    expect(uniqueSlug("throw", ["scrum"])).toBe("throw");
  });
  it("appends the first free numeric suffix", () => {
    expect(uniqueSlug("throw", ["throw", "throw-2"])).toBe("throw-3");
  });
});
```

`src/lib/admin/reorder.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { reorderIds } from "@/lib/admin/reorder";

describe("reorderIds", () => {
  it("moves an id up one place", () => {
    expect(reorderIds([1, 2, 3], 3, "up")).toEqual([1, 3, 2]);
  });
  it("moves an id down one place", () => {
    expect(reorderIds([1, 2, 3], 1, "down")).toEqual([2, 1, 3]);
  });
  it("is a no-op at the edges", () => {
    expect(reorderIds([1, 2, 3], 1, "up")).toEqual([1, 2, 3]);
    expect(reorderIds([1, 2, 3], 3, "down")).toEqual([1, 2, 3]);
  });
  it("is a no-op for a single item or an unknown id", () => {
    expect(reorderIds([7], 7, "up")).toEqual([7]);
    expect(reorderIds([1, 2], 9, "down")).toEqual([1, 2]);
  });
});
```

- [ ] **Step 6: Run them** — Expected: FAIL, modules not found.

- [ ] **Step 7: Create `src/lib/admin/slug.ts` and `src/lib/admin/reorder.ts`**

```ts
// slug.ts
export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "item";
}

export function uniqueSlug(base: string, taken: string[]): string {
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
```

```ts
// reorder.ts
export type Direction = "up" | "down";

export function reorderIds(ids: number[], id: number, direction: Direction): number[] {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return [...ids];
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
```

- [ ] **Step 8: Run all tests** — `npm test` — Expected: all pass.

- [ ] **Step 9: Create `src/lib/admin/fields.ts`** (field definitions, plain data so they can cross the server/client boundary)

```ts
export type FieldDef = { name: string; label: string; hint?: string } & (
  | { kind: "text" | "email" | "slug" | "image" | "password"; placeholder?: string }
  | { kind: "textarea"; rows?: number; placeholder?: string }
  | { kind: "toggle" }
  | { kind: "select"; options: { value: string; label: string }[] }
  | { kind: "list"; max?: number }
  | { kind: "pairs"; labels: [string, string]; max?: number }
);

/* Loose on purpose: pages spread whole DB rows (dates, numbers) into it; ResourceForm only reads strings, booleans and arrays. */
export type FormValues = Record<string, unknown>;
```

- [ ] **Step 10: Create `src/components/admin/fields.tsx`** (server-safe primitives)

```tsx
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-line bg-steel px-4 py-3 text-bone placeholder:text-mist/60 focus:border-bone focus:outline-none disabled:opacity-60";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="block text-[11px] uppercase tracking-[0.28em] text-mist">{label}</span>
      {children}
      {hint && !error && <p className="text-xs text-mist">{hint}</p>}
      {error && <p role="alert" className="text-xs text-accent">{error}</p>}
    </div>
  );
}

export function Toggle({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-1 h-4 w-4 accent-[var(--color-accent)]" />
      <span>
        <span className="block text-sm text-bone">{label}</span>
        {hint && <span className="block text-xs text-mist">{hint}</span>}
      </span>
    </label>
  );
}

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[1.25rem] border border-line bg-coal p-6", className)}>{children}</div>;
}
```

- [ ] **Step 11: Create `src/components/admin/ListEditor.tsx`** (client)

```tsx
"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash } from "@phosphor-icons/react";

import { inputClass } from "./fields";

export default function ListEditor({ name, initial, max = 8 }: { name: string; initial: string[]; max?: number }) {
  const [items, setItems] = useState<string[]>(initial.length ? initial : [""]);
  const update = (i: number, v: string) => setItems((p) => p.map((x, j) => (j === i ? v : x)));
  const remove = (i: number) => setItems((p) => (p.length === 1 ? [""] : p.filter((_, j) => j !== i)));
  const move = (i: number, d: -1 | 1) =>
    setItems((p) => {
      const t = i + d;
      if (t < 0 || t >= p.length) return p;
      const n = [...p];
      [n[i], n[t]] = [n[t], n[i]];
      return n;
    });

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input value={item} onChange={(e) => update(i, e.target.value)} className={inputClass} />
          <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="text-mist hover:text-bone"><ArrowUp size={16} /></button>
          <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="text-mist hover:text-bone"><ArrowDown size={16} /></button>
          <button type="button" aria-label="Remove" onClick={() => remove(i)} className="text-mist hover:text-accent"><Trash size={16} /></button>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => setItems((p) => [...p, ""])} className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-mist hover:text-bone">
          <Plus size={14} /> Add
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 12: Create `src/components/admin/PairListEditor.tsx`** (client; same shape, two inputs per row)

```tsx
"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash } from "@phosphor-icons/react";

import { inputClass } from "./fields";

type Pair = { name: string; detail: string };

export default function PairListEditor({
  name, initial, labels, max = 8,
}: { name: string; initial: Pair[]; labels: [string, string]; max?: number }) {
  const empty: Pair = { name: "", detail: "" };
  const [items, setItems] = useState<Pair[]>(initial.length ? initial : [empty]);
  const update = (i: number, patch: Partial<Pair>) => setItems((p) => p.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const remove = (i: number) => setItems((p) => (p.length === 1 ? [empty] : p.filter((_, j) => j !== i)));
  const move = (i: number, d: -1 | 1) =>
    setItems((p) => {
      const t = i + d;
      if (t < 0 || t >= p.length) return p;
      const n = [...p];
      [n[i], n[t]] = [n[t], n[i]];
      return n;
    });

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(items)} />
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-line p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <input placeholder={labels[0]} value={item.name} onChange={(e) => update(i, { name: e.target.value })} className={inputClass} />
            <input placeholder={labels[1]} value={item.detail} onChange={(e) => update(i, { detail: e.target.value })} className={inputClass} />
          </div>
          <div className="mt-2 flex gap-3 text-mist">
            <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="hover:text-bone"><ArrowUp size={16} /></button>
            <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="hover:text-bone"><ArrowDown size={16} /></button>
            <button type="button" aria-label="Remove" onClick={() => remove(i)} className="hover:text-accent"><Trash size={16} /></button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => setItems((p) => [...p, empty])} className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-mist hover:text-bone">
          <Plus size={14} /> Add
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 13: Create `src/components/admin/SubmitButton.tsx`**

```tsx
"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, pendingLabel = "Saving" }: { children: React.ReactNode; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-6 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-accent-deep disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
```

- [ ] **Step 14: Create `src/components/admin/ResourceForm.tsx`** (client, config-driven)

```tsx
"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { FieldDef, FormValues } from "@/lib/admin/fields";
import { initialState, type ActionState } from "@/lib/admin/form";
import { Field, Toggle, inputClass } from "./fields";
import ListEditor from "./ListEditor";
import PairListEditor from "./PairListEditor";
import SubmitButton from "./SubmitButton";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fields: FieldDef[];
  initial: FormValues;
  submitLabel?: string;
  cancelHref?: string;
  hidden?: Record<string, string>;
};

export default function ResourceForm({ action, fields, initial, submitLabel = "Save", cancelHref, hidden }: Props) {
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.status === "error" ? state.errors : {};
  const str = (name: string) => {
    const v = initial[name];
    return typeof v === "string" ? v : "";
  };

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.message && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">{state.message}</p>
      )}
      {state.status === "success" && state.message && (
        <p role="status" className="rounded-xl border border-line bg-steel px-4 py-3 text-sm">{state.message}</p>
      )}
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}

      {fields.map((f) => {
        const error = errors[f.name];
        switch (f.kind) {
          case "toggle":
            return <Toggle key={f.name} name={f.name} label={f.label} hint={f.hint} defaultChecked={initial[f.name] === true} />;
          case "textarea":
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <textarea name={f.name} rows={f.rows ?? 4} defaultValue={str(f.name)} placeholder={f.placeholder} className={inputClass} />
              </Field>
            );
          case "select":
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <select name={f.name} defaultValue={str(f.name)} className={inputClass}>
                  {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            );
          case "list":
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <ListEditor name={f.name} initial={Array.isArray(initial[f.name]) ? (initial[f.name] as string[]) : []} max={f.max} />
              </Field>
            );
          case "pairs":
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <PairListEditor
                  name={f.name}
                  labels={f.labels}
                  max={f.max}
                  initial={Array.isArray(initial[f.name]) ? (initial[f.name] as { name: string; detail: string }[]) : []}
                />
              </Field>
            );
          case "image": {
            const src = str(f.name);
            return (
              <Field key={f.name} label={f.label} hint={f.hint ?? "A URL or a path under /images"} error={error}>
                <div className="flex gap-3">
                  {src && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
                  )}
                  <input name={f.name} defaultValue={src} placeholder={f.placeholder} className={inputClass} />
                </div>
              </Field>
            );
          }
          default:
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <input
                  name={f.name}
                  type={f.kind === "password" ? "password" : f.kind === "email" ? "email" : "text"}
                  defaultValue={f.kind === "password" ? undefined : str(f.name)}
                  placeholder={f.placeholder}
                  autoComplete={f.kind === "password" ? "new-password" : undefined}
                  className={inputClass}
                />
              </Field>
            );
        }
      })}

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        {cancelHref && <Link href={cancelHref} className="text-xs uppercase tracking-[0.2em] text-mist hover:text-bone">Cancel</Link>}
      </div>
    </form>
  );
}
```

- [ ] **Step 15: Create `src/components/admin/ConfirmDialog.tsx`** and `RowControls.tsx` (client)

```tsx
// ConfirmDialog.tsx
"use client";

export default function ConfirmDialog({
  open, title, onConfirm, onCancel,
}: { open: boolean; title: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-5">
      <div className="w-full max-w-sm rounded-[1.25rem] border border-line bg-coal p-6">
        <p className="text-sm">{title}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.2em]">Cancel</button>
          <button type="button" onClick={onConfirm} className="rounded-full bg-accent px-4 py-2 text-xs uppercase tracking-[0.2em] text-bone">Delete</button>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// RowControls.tsx
"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Eye, EyeSlash, Trash } from "@phosphor-icons/react";

import type { Direction } from "@/lib/admin/reorder";
import ConfirmDialog from "./ConfirmDialog";

type Props = {
  id: number;
  label: string;
  published?: boolean;
  isFirst: boolean;
  isLast: boolean;
  onMove: (id: number, direction: Direction) => Promise<void>;
  onToggle?: (id: number, published: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

export default function RowControls({ id, label, published, isFirst, isLast, onMove, onToggle, onDelete }: Props) {
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const btn = "rounded-lg p-1.5 text-mist hover:bg-steel hover:text-bone disabled:opacity-30";

  return (
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Move up" disabled={pending || isFirst} onClick={() => start(() => onMove(id, "up"))} className={btn}><ArrowUp size={16} /></button>
      <button type="button" aria-label="Move down" disabled={pending || isLast} onClick={() => start(() => onMove(id, "down"))} className={btn}><ArrowDown size={16} /></button>
      {onToggle && (
        <button type="button" aria-label={published ? "Hide" : "Publish"} disabled={pending} onClick={() => start(() => onToggle(id, !published))} className={btn}>
          {published ? <Eye size={16} /> : <EyeSlash size={16} />}
        </button>
      )}
      <button type="button" aria-label="Delete" disabled={pending} onClick={() => setConfirm(true)} className={btn}><Trash size={16} /></button>
      <ConfirmDialog
        open={confirm}
        title={`Delete "${label}"? This cannot be undone.`}
        onCancel={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); start(() => onDelete(id)); }}
      />
    </div>
  );
}
```

- [ ] **Step 16: Create `src/components/admin/ResourceList.tsx`** (server component)

```tsx
import Link from "next/link";

import StatusBadge from "./StatusBadge";

export type ListRow = { id: number; title: string; subtitle?: string; published?: boolean; href: string };

export default function ResourceList({ rows, controls }: { rows: ListRow[]; controls: (row: ListRow, i: number) => React.ReactNode }) {
  if (rows.length === 0) {
    return <p className="rounded-[1.25rem] border border-dashed border-line p-8 text-center text-sm text-mist">Nothing here yet.</p>;
  }
  return (
    <ul className="divide-y divide-line rounded-[1.25rem] border border-line bg-coal">
      {rows.map((row, i) => (
        <li key={row.id} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <Link href={row.href} className="block truncate font-medium hover:underline">{row.title}</Link>
            {row.subtitle && <p className="truncate text-xs text-mist">{row.subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {row.published !== undefined && <StatusBadge status={row.published ? "published" : "hidden"} />}
            {controls(row, i)}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 17: Type-check and commit**

`npx tsc --noEmit` clean, `npm test` green.

```bash
git add src/lib/admin src/components/admin
git commit -m "feat(admin): add validation schemas, slug and reorder helpers, and form primitives"
```

### Task 11: Programmes actions and pages

**Files:**
- Create: `src/lib/admin/actions/programs.ts`, `src/lib/admin/actions/shared.ts`, `src/app/admin/(panel)/programmes/page.tsx`, `src/app/admin/(panel)/programmes/new/page.tsx`, `src/app/admin/(panel)/programmes/[id]/page.tsx`, `src/app/admin/(panel)/programmes/fields.ts`

**Interfaces:**
- Produces: `saveProgram(id: number | null, prev, formData)`, `deleteProgram(id)`, `moveProgram(id, direction)`, `toggleProgram(id, published)`; helper `applyOrder(db, table, orderedIds)` in `shared.ts`.

- [ ] **Step 1: Create `src/lib/admin/actions/shared.ts`**

```ts
import "server-only";
import { asc, eq, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { getDb, type Db } from "@/lib/db/client";
import { reorderIds, type Direction } from "@/lib/admin/reorder";

type Sortable = PgTable & { id: { name: string }; sortOrder: { name: string } };

/* Renumber a table's rows 0..n-1 after moving one of them. */
export async function moveRow(table: Sortable, id: number, direction: Direction, where?: ReturnType<typeof eq>) {
  const db = getDb();
  const t = table as unknown as { id: Parameters<typeof asc>[0] & { name: string }; sortOrder: Parameters<typeof asc>[0] };
  const base = db.select({ id: t.id as unknown as typeof t.id }).from(table);
  const rows = (await (where ? base.where(where) : base).orderBy(asc(t.sortOrder), asc(t.id))) as { id: number }[];
  const ordered = reorderIds(rows.map((r) => r.id), id, direction);
  await applyOrder(db, table, ordered);
}

export async function applyOrder(db: Db, table: Sortable, orderedIds: number[]) {
  await db.transaction(async (tx) => {
    for (const [i, rowId] of orderedIds.entries()) {
      await tx.execute(sql`update ${table} set sort_order = ${i} where id = ${rowId}`);
    }
  });
}

export async function nextSortOrder(table: Sortable, where?: ReturnType<typeof eq>): Promise<number> {
  const db = getDb();
  const q = db.select({ max: sql<number>`coalesce(max(sort_order), -1)` }).from(table);
  const [row] = await (where ? q.where(where) : q);
  return Number(row.max) + 1;
}
```

If the generic typing fights you, type `table` as `any` for these three helpers only and add an eslint-disable comment; the behaviour matters more than the generics here.

- [ ] **Step 2: Create `src/lib/admin/actions/programs.ts`**

```ts
"use server";

import { eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/queries";
import { getDb } from "@/lib/db/client";
import { programs } from "@/lib/db/schema";
import { fail, formObject, zodErrors, type ActionState } from "@/lib/admin/form";
import { programSchema } from "@/lib/admin/schemas";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import type { Direction } from "@/lib/admin/reorder";
import { moveRow, nextSortOrder } from "./shared";

const LIST = "/admin/programmes";

export async function saveProgram(id: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = programSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  const data = parsed.data;
  const db = getDb();

  const others = await db.select({ slug: programs.slug }).from(programs).where(id ? ne(programs.id, id) : undefined);
  const slug = uniqueSlug(data.slug || slugify(data.title), others.map((o) => o.slug));

  const values = {
    slug,
    format: data.format,
    title: data.title,
    summary: data.summary,
    listTitle: data.listTitle,
    points: data.points,
    imageSrc: data.imageSrc,
    imageAlt: data.imageAlt,
    price: data.price,
    priceNote: data.priceNote || null,
    showPrice: data.showPrice,
    published: data.published,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(programs).set(values).where(eq(programs.id, id));
  } else {
    await db.insert(programs).values({ ...values, sortOrder: await nextSortOrder(programs) });
  }
  updateTag(TAGS.programs);
  redirect(`${LIST}?saved=1`);
}

export async function deleteProgram(id: number): Promise<void> {
  await requireAdmin();
  await getDb().delete(programs).where(eq(programs.id, id));
  updateTag(TAGS.programs);
  redirect(`${LIST}?saved=deleted`);
}

export async function moveProgram(id: number, direction: Direction): Promise<void> {
  await requireAdmin();
  await moveRow(programs, id, direction);
  updateTag(TAGS.programs);
}

export async function toggleProgram(id: number, published: boolean): Promise<void> {
  await requireAdmin();
  await getDb().update(programs).set({ published, updatedAt: new Date() }).where(eq(programs.id, id));
  updateTag(TAGS.programs);
}
```

- [ ] **Step 3: Create `src/app/admin/(panel)/programmes/fields.ts`**

```ts
import type { FieldDef } from "@/lib/admin/fields";

export const programFields: FieldDef[] = [
  { kind: "text", name: "title", label: "Title" },
  { kind: "slug", name: "slug", label: "Slug", hint: "Leave empty to generate from the title" },
  { kind: "text", name: "format", label: "Format pill", placeholder: "Online, One-on-one, Small group…" },
  { kind: "textarea", name: "summary", label: "Summary", rows: 3 },
  { kind: "text", name: "listTitle", label: "List title", placeholder: "At a glance" },
  { kind: "list", name: "points", label: "Points", max: 8 },
  { kind: "image", name: "imageSrc", label: "Image" },
  { kind: "text", name: "imageAlt", label: "Image description" },
  { kind: "text", name: "price", label: "Price", hint: "Number only, e.g. 150 or 149.50. Leave empty for no price." },
  { kind: "text", name: "priceNote", label: "Price note", placeholder: "per week, per session, from…" },
  { kind: "toggle", name: "showPrice", label: "Show price on the site", hint: "Also needs the global pricing switch in Settings." },
  { kind: "toggle", name: "published", label: "Published" },
];
```

- [ ] **Step 4: Create the list page `src/app/admin/(panel)/programmes/page.tsx`**

```tsx
import { asc } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import ResourceList from "@/components/admin/ResourceList";
import RowControls from "@/components/admin/RowControls";
import { deleteProgram, moveProgram, toggleProgram } from "@/lib/admin/actions/programs";
import { getDb } from "@/lib/db/client";
import { programs } from "@/lib/db/schema";

export default async function ProgrammesPage() {
  const rows = await getDb().select().from(programs).orderBy(asc(programs.sortOrder), asc(programs.id));
  const list = rows.map((r) => ({ id: r.id, title: r.title, subtitle: r.format, published: r.published, href: `/admin/programmes/${r.id}` }));
  return (
    <>
      <PageHeader title="Programmes" description="The cards in the Programmes section." action={{ label: "New programme", href: "/admin/programmes/new" }} />
      <ResourceList
        rows={list}
        controls={(row, i) => (
          <RowControls
            id={row.id}
            label={row.title}
            published={row.published}
            isFirst={i === 0}
            isLast={i === list.length - 1}
            onMove={moveProgram}
            onToggle={toggleProgram}
            onDelete={deleteProgram}
          />
        )}
      />
    </>
  );
}
```

- [ ] **Step 5: Create the new and edit pages**

`src/app/admin/(panel)/programmes/new/page.tsx`:

```tsx
import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveProgram } from "@/lib/admin/actions/programs";
import { programFields } from "../fields";

export default function NewProgrammePage() {
  return (
    <>
      <PageHeader title="New programme" />
      <Panel>
        <ResourceForm
          action={saveProgram.bind(null, null)}
          fields={programFields}
          initial={{ listTitle: "At a glance", published: true, showPrice: false, points: [] }}
          submitLabel="Create programme"
          cancelHref="/admin/programmes"
        />
      </Panel>
    </>
  );
}
```

`src/app/admin/(panel)/programmes/[id]/page.tsx`:

```tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveProgram } from "@/lib/admin/actions/programs";
import { getDb } from "@/lib/db/client";
import { programs } from "@/lib/db/schema";
import { programFields } from "../fields";

export default async function EditProgrammePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await getDb().select().from(programs).where(eq(programs.id, id));
  if (!row) notFound();

  return (
    <>
      <PageHeader title={row.title} description={`/${row.slug}`} />
      <Panel>
        <ResourceForm
          action={saveProgram.bind(null, id)}
          fields={programFields}
          initial={{ ...row, price: row.price ?? "", priceNote: row.priceNote ?? "" }}
          cancelHref="/admin/programmes"
        />
      </Panel>
    </>
  );
}
```

- [ ] **Step 6: Verify in the browser** — list shows 4 programmes in order; move one down and reload the public page to see the order change; hide one and confirm it disappears from the site; create a new one with a bad price and see the field error; set a price plus "Show price" (global switch still off, so nothing shows yet); delete the test programme with the confirm dialog. `npx tsc --noEmit` clean.

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/actions "src/app/admin/(panel)/programmes"
git commit -m "feat(admin): programmes CRUD with reorder, publish and pricing"
```

### Task 12: Expertise actions and pages

**Files:**
- Create: `src/lib/admin/actions/expertise.ts`, `src/app/admin/(panel)/expertise/page.tsx`, `src/app/admin/(panel)/expertise/new/page.tsx`, `src/app/admin/(panel)/expertise/[id]/page.tsx`, `src/app/admin/(panel)/expertise/fields.ts`

**Interfaces:**
- Produces: `savePillar(id | null, prev, formData)` (replaces the pillar's skills wholesale), `deletePillar(id)`, `movePillar(id, direction)`, `togglePillar(id, published)`.

- [ ] **Step 1: Create `src/lib/admin/actions/expertise.ts`**

```ts
"use server";

import { eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/queries";
import { getDb } from "@/lib/db/client";
import { expertisePillars, expertiseSkills } from "@/lib/db/schema";
import { fail, formObject, zodErrors, type ActionState } from "@/lib/admin/form";
import { pillarSchema } from "@/lib/admin/schemas";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import type { Direction } from "@/lib/admin/reorder";
import { moveRow, nextSortOrder } from "./shared";

const LIST = "/admin/expertise";

export async function savePillar(id: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = pillarSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  const { skills, ...data } = parsed.data;
  const db = getDb();

  const others = await db.select({ slug: expertisePillars.slug }).from(expertisePillars).where(id ? ne(expertisePillars.id, id) : undefined);
  const slug = uniqueSlug(data.slug || slugify(data.word), others.map((o) => o.slug));
  const values = { ...data, slug, updatedAt: new Date() };

  await db.transaction(async (tx) => {
    let pillarId = id;
    if (pillarId) {
      await tx.update(expertisePillars).set(values).where(eq(expertisePillars.id, pillarId));
      await tx.delete(expertiseSkills).where(eq(expertiseSkills.pillarId, pillarId));
    } else {
      const [row] = await tx
        .insert(expertisePillars)
        .values({ ...values, sortOrder: await nextSortOrder(expertisePillars) })
        .returning({ id: expertisePillars.id });
      pillarId = row.id;
    }
    await tx.insert(expertiseSkills).values(skills.map((s, i) => ({ ...s, pillarId: pillarId!, sortOrder: i })));
  });

  updateTag(TAGS.expertise);
  redirect(`${LIST}?saved=1`);
}

export async function deletePillar(id: number): Promise<void> {
  await requireAdmin();
  await getDb().delete(expertisePillars).where(eq(expertisePillars.id, id));
  updateTag(TAGS.expertise);
  redirect(`${LIST}?saved=deleted`);
}

export async function movePillar(id: number, direction: Direction): Promise<void> {
  await requireAdmin();
  await moveRow(expertisePillars, id, direction);
  updateTag(TAGS.expertise);
}

export async function togglePillar(id: number, published: boolean): Promise<void> {
  await requireAdmin();
  await getDb().update(expertisePillars).set({ published, updatedAt: new Date() }).where(eq(expertisePillars.id, id));
  updateTag(TAGS.expertise);
}
```

- [ ] **Step 2: Create `fields.ts`**

```ts
import type { FieldDef } from "@/lib/admin/fields";

export const pillarFields: FieldDef[] = [
  { kind: "text", name: "word", label: "Word", placeholder: "Throw" },
  { kind: "slug", name: "slug", label: "Slug", hint: "Leave empty to generate from the word" },
  { kind: "textarea", name: "summary", label: "Summary", rows: 2 },
  { kind: "image", name: "imageSrc", label: "Image" },
  { kind: "text", name: "imageAlt", label: "Image description" },
  { kind: "pairs", name: "skills", label: "Skills", labels: ["Skill name", "One-line detail"], max: 8 },
  { kind: "toggle", name: "panel", label: "Show skill detail in a card with arrows", hint: "Off shows a plain one-liner." },
  { kind: "toggle", name: "published", label: "Published" },
];
```

- [ ] **Step 3: Create the three pages** following the programmes pages exactly, with these substitutions: table `expertisePillars`, actions `movePillar`/`togglePillar`/`deletePillar`/`savePillar`, fields `pillarFields`, titles "Expertise" / "New pillar" / `row.word`, list subtitle `row.summary`, hrefs under `/admin/expertise`. The edit page must also load the skills and pass them in `initial`:

```tsx
const skills = await getDb()
  .select({ name: expertiseSkills.name, detail: expertiseSkills.detail })
  .from(expertiseSkills)
  .where(eq(expertiseSkills.pillarId, id))
  .orderBy(asc(expertiseSkills.sortOrder), asc(expertiseSkills.id));
// ...
initial={{ ...row, skills }}
```

and the new page uses `initial={{ panel: true, published: true, skills: [] }}`.

- [ ] **Step 4: Verify** — edit the "Throw" pillar: reorder two skills, save, confirm the public Expertise section shows the new order. Add a fourth pillar, hide it, delete it. `npx tsc --noEmit` clean.

- [ ] **Step 5: Commit**

```bash
git add src/lib/admin/actions/expertise.ts "src/app/admin/(panel)/expertise"
git commit -m "feat(admin): expertise pillars and skills CRUD"
```

### Task 13: Testimonials and FAQ actions and pages

**Files:**
- Create: `src/lib/admin/actions/testimonials.ts`, `src/lib/admin/actions/faqs.ts`, pages under `src/app/admin/(panel)/testimonials/` and `src/app/admin/(panel)/faq/` (`page.tsx`, `new/page.tsx`, `[id]/page.tsx`, `fields.ts`)

**Interfaces:**
- Produces: `saveTestimonial`, `deleteTestimonial`, `moveTestimonial`, `toggleTestimonial`; `saveFaq`, `deleteFaq`, `moveFaq`, `toggleFaq` (same signatures as the programme actions).

- [ ] **Step 1: Create `src/lib/admin/actions/testimonials.ts`**

```ts
"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/queries";
import { getDb } from "@/lib/db/client";
import { testimonials } from "@/lib/db/schema";
import { fail, formObject, zodErrors, type ActionState } from "@/lib/admin/form";
import { testimonialSchema } from "@/lib/admin/schemas";
import type { Direction } from "@/lib/admin/reorder";
import { moveRow, nextSortOrder } from "./shared";

const LIST = "/admin/testimonials";

export async function saveTestimonial(id: number | null, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  const values = { ...parsed.data, updatedAt: new Date() };
  const db = getDb();
  if (id) await db.update(testimonials).set(values).where(eq(testimonials.id, id));
  else await db.insert(testimonials).values({ ...values, sortOrder: await nextSortOrder(testimonials) });
  updateTag(TAGS.testimonials);
  redirect(`${LIST}?saved=1`);
}

export async function deleteTestimonial(id: number): Promise<void> {
  await requireAdmin();
  await getDb().delete(testimonials).where(eq(testimonials.id, id));
  updateTag(TAGS.testimonials);
  redirect(`${LIST}?saved=deleted`);
}

export async function moveTestimonial(id: number, direction: Direction): Promise<void> {
  await requireAdmin();
  await moveRow(testimonials, id, direction);
  updateTag(TAGS.testimonials);
}

export async function toggleTestimonial(id: number, published: boolean): Promise<void> {
  await requireAdmin();
  await getDb().update(testimonials).set({ published, updatedAt: new Date() }).where(eq(testimonials.id, id));
  updateTag(TAGS.testimonials);
}
```

- [ ] **Step 2: Create `src/lib/admin/actions/faqs.ts`** — identical structure with `faqs`, `faqSchema`, `TAGS.faqs`, `LIST = "/admin/faq"`, names `saveFaq`, `deleteFaq`, `moveFaq`, `toggleFaq`.

- [ ] **Step 3: Field configs**

```ts
// testimonials/fields.ts
export const testimonialFields: FieldDef[] = [
  { kind: "text", name: "name", label: "Name" },
  { kind: "text", name: "role", label: "Role", placeholder: "Hooker, Lock, Coach…" },
  { kind: "text", name: "org", label: "Team or organisation" },
  { kind: "image", name: "imageSrc", label: "Photo" },
  { kind: "textarea", name: "quote", label: "Quote", rows: 4 },
  { kind: "toggle", name: "published", label: "Published" },
];
```

```ts
// faq/fields.ts
export const faqFields: FieldDef[] = [
  { kind: "text", name: "question", label: "Question" },
  { kind: "textarea", name: "answer", label: "Answer", rows: 5 },
  { kind: "toggle", name: "published", label: "Published" },
];
```

- [ ] **Step 4: Pages** — same three pages as programmes for each, with list `title` = `r.name` / `r.question`, subtitle = `${r.role}, ${r.org}` / none, and `initial={{ published: true }}` for the new pages.

- [ ] **Step 5: Verify** — replace one pravatar testimonial image with a real `/images/...` path and see the public site update; add an FAQ and check `/faq` plus its JSON-LD (view source) include it. `npx tsc --noEmit` clean.

- [ ] **Step 6: Commit**

```bash
git add src/lib/admin/actions "src/app/admin/(panel)/testimonials" "src/app/admin/(panel)/faq"
git commit -m "feat(admin): testimonials and FAQ CRUD"
```

### Task 14: Section copy, site settings and account

**Files:**
- Create: `src/lib/admin/actions/sections.ts`, `src/lib/admin/actions/settings.ts`, `src/lib/admin/actions/account.ts`, `src/app/admin/(panel)/sections/page.tsx`, `src/app/admin/(panel)/settings/page.tsx`, `src/app/admin/(panel)/account/page.tsx`

**Interfaces:**
- Produces: `saveSection(prev, formData)` (key is a hidden field), `saveSettings(prev, formData)`, `saveAccount(prev, formData)`, `changePassword(prev, formData)` (both resolve the user from the session via `requireAdmin`).

- [ ] **Step 1: Create `src/lib/admin/actions/sections.ts`**

```ts
"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/queries";
import { getDb } from "@/lib/db/client";
import { sectionCopy } from "@/lib/db/schema";
import { fail, formObject, ok, zodErrors, type ActionState } from "@/lib/admin/form";
import { sectionSchema } from "@/lib/admin/schemas";

export async function saveSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = sectionSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  const { key, ...data } = parsed.data;
  const nullable = (v: string) => (v === "" ? null : v);
  await getDb()
    .update(sectionCopy)
    .set({
      eyebrow: data.eyebrow,
      headline: data.headline,
      headlineAccent: nullable(data.headlineAccent),
      intro: nullable(data.intro),
      ctaLabel: nullable(data.ctaLabel),
      ctaHref: nullable(data.ctaHref),
      heroImage: nullable(data.heroImage),
      updatedAt: new Date(),
    })
    .where(eq(sectionCopy.key, key));
  updateTag(TAGS.sections);
  return ok("Saved.");
}
```

- [ ] **Step 2: Create `src/app/admin/(panel)/sections/page.tsx`** — one `ResourceForm` per section inside a details/accordion list. Each section's field list differs slightly:

```tsx
import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveSection } from "@/lib/admin/actions/sections";
import type { FieldDef } from "@/lib/admin/fields";
import { getDb } from "@/lib/db/client";
import { SECTION_KEYS, sectionCopy, type SectionKey } from "@/lib/db/schema";

const base: FieldDef[] = [
  { kind: "text", name: "eyebrow", label: "Eyebrow" },
  { kind: "textarea", name: "headline", label: "Headline", rows: 2, hint: "One line per visual line." },
];
const accent: FieldDef = { kind: "text", name: "headlineAccent", label: "Accent word", hint: "Rendered in red after the headline." };
const intro: FieldDef = { kind: "textarea", name: "intro", label: "Intro", rows: 3 };
const cta: FieldDef[] = [
  { kind: "text", name: "ctaLabel", label: "Button label" },
  { kind: "text", name: "ctaHref", label: "Button link" },
];
const hero: FieldDef = { kind: "image", name: "heroImage", label: "Hero image" };

const fieldsFor: Record<SectionKey, FieldDef[]> = {
  programs: [...base, ...cta],
  expertise: [...base, accent, intro],
  testimonials: [...base, accent],
  faq: [...base, intro, hero],
  contact: [...base, intro],
  online: [{ kind: "text", name: "ctaLabel", label: "Register button label" }],
};
const titles: Record<SectionKey, string> = {
  programs: "Programmes", expertise: "Expertise", testimonials: "Testimonials", faq: "FAQ", contact: "Contact", online: "Online programme",
};

export default async function SectionsPage() {
  const rows = await getDb().select().from(sectionCopy);
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
  return (
    <>
      <PageHeader title="Section copy" description="Headings and intros for each section of the site." />
      <div className="space-y-4">
        {SECTION_KEYS.map((key) => {
          const row = byKey[key];
          if (!row) return null;
          return (
            <details key={key} className="group rounded-[1.25rem] border border-line bg-coal" open={key === "programs"}>
              <summary className="cursor-pointer px-6 py-4 font-display text-2xl">{titles[key]}</summary>
              <Panel className="rounded-t-none border-0 border-t">
                <ResourceForm
                  action={saveSection}
                  fields={fieldsFor[key]}
                  hidden={{ key }}
                  initial={{
                    ...row,
                    headlineAccent: row.headlineAccent ?? "", intro: row.intro ?? "",
                    ctaLabel: row.ctaLabel ?? "", ctaHref: row.ctaHref ?? "", heroImage: row.heroImage ?? "",
                  }}
                />
              </Panel>
            </details>
          );
        })}
      </div>
    </>
  );
}
```

`sectionSchema` requires `eyebrow` and `headline`, but the `online` form only shows `ctaLabel`; pass them as hidden fields too: `hidden={{ key, ...(key === "online" ? { eyebrow: row.eyebrow, headline: row.headline } : {}) }}`.

- [ ] **Step 3: Create `src/lib/admin/actions/settings.ts`**

```ts
"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/queries";
import { getDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";
import { fail, formObject, ok, zodErrors, type ActionState } from "@/lib/admin/form";
import { settingsSchema } from "@/lib/admin/schemas";

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  await getDb().update(siteSettings).set({ ...parsed.data, updatedAt: new Date() }).where(eq(siteSettings.id, 1));
  updateTag(TAGS.settings);
  return ok("Settings saved.");
}
```

- [ ] **Step 4: Create `src/app/admin/(panel)/settings/page.tsx`**

```tsx
import { eq } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveSettings } from "@/lib/admin/actions/settings";
import type { FieldDef } from "@/lib/admin/fields";
import { getDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";

const fields: FieldDef[] = [
  { kind: "toggle", name: "showPricing", label: "Show programme prices on the site", hint: "Each programme also has its own switch. Both must be on." },
  { kind: "text", name: "currency", label: "Currency code", placeholder: "NZD" },
  { kind: "email", name: "contactEmail", label: "Public contact email", hint: "Shown in the navbar, footer and contact section." },
  { kind: "email", name: "notificationEmail", label: "Notification email", hint: "Where new enquiries and registrations are sent." },
  { kind: "text", name: "fromName", label: "Sender name" },
  { kind: "email", name: "fromEmail", label: "Sender email", hint: "Must be on a domain verified in Resend." },
];

export default async function SettingsPage() {
  const [row] = await getDb().select().from(siteSettings).where(eq(siteSettings.id, 1));
  return (
    <>
      <PageHeader title="Settings" description="Pricing, contact and email configuration." />
      <Panel>
        <ResourceForm action={saveSettings} fields={fields} initial={{ ...row }} />
      </Panel>
    </>
  );
}
```

- [ ] **Step 5: Create `src/lib/admin/actions/account.ts`**

```ts
"use server";

import { eq, ne } from "drizzle-orm";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";
import { fail, formObject, ok, zodErrors, type ActionState } from "@/lib/admin/form";
import { accountSchema, passwordSchema } from "@/lib/admin/schemas";

export async function saveAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = accountSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  const db = getDb();
  const [clash] = await db.select({ id: adminUsers.id }).from(adminUsers)
    .where(eq(adminUsers.email, parsed.data.email)).limit(1);
  if (clash && clash.id !== user.id) return fail({ email: "That email is already in use." });
  await db.update(adminUsers).set({ ...parsed.data, updatedAt: new Date() }).where(eq(adminUsers.id, user.id));
  return ok("Account updated.");
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = passwordSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  const db = getDb();
  const [row] = await db.select({ hash: adminUsers.passwordHash }).from(adminUsers).where(eq(adminUsers.id, user.id));
  if (!row || !(await verifyPassword(parsed.data.currentPassword, row.hash))) {
    return fail({ currentPassword: "Current password is incorrect." });
  }
  await db.update(adminUsers)
    .set({ passwordHash: await hashPassword(parsed.data.newPassword), updatedAt: new Date() })
    .where(eq(adminUsers.id, user.id));
  return ok("Password changed.");
}
```

(`ne` is unused; drop the import.)

- [ ] **Step 6: Create `src/app/admin/(panel)/account/page.tsx`**

```tsx
import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { changePassword, saveAccount } from "@/lib/admin/actions/account";
import type { FieldDef } from "@/lib/admin/fields";
import { requireAdmin } from "@/lib/auth/dal";

const profile: FieldDef[] = [
  { kind: "text", name: "name", label: "Name" },
  { kind: "email", name: "email", label: "Email", hint: "You sign in with this." },
];
const password: FieldDef[] = [
  { kind: "password", name: "currentPassword", label: "Current password" },
  { kind: "password", name: "newPassword", label: "New password", hint: "At least 10 characters." },
  { kind: "password", name: "confirmPassword", label: "Confirm new password" },
];

export default async function AccountPage() {
  const user = await requireAdmin();
  return (
    <>
      <PageHeader title="Account" description="Your admin sign-in details." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-6 font-display text-2xl">Profile</h2>
          <ResourceForm action={saveAccount} fields={profile} initial={{ name: user.name, email: user.email }} />
        </Panel>
        <Panel>
          <h2 className="mb-6 font-display text-2xl">Password</h2>
          <ResourceForm action={changePassword} fields={password} initial={{}} submitLabel="Change password" />
        </Panel>
      </div>
    </>
  );
}
```

- [ ] **Step 7: Verify** — change the Programmes headline to three lines and see the public heading update; turn on "Show prices" plus a programme's own switch and see `$150` on the card, then turn the global switch off and watch it disappear; change the contact email and check the footer; change the password, sign out, sign in with the new one. `npx tsc --noEmit` clean.

- [ ] **Step 8: Commit**

```bash
git add src/lib/admin/actions "src/app/admin/(panel)/sections" "src/app/admin/(panel)/settings" "src/app/admin/(panel)/account"
git commit -m "feat(admin): section copy, site settings and account pages"
```

## Phase 5 — Inboxes and email

### Task 15: Email client, templates and notify helpers

**Files:**
- Create: `src/lib/email/resend.ts`, `src/lib/email/templates.ts`, `src/lib/email/notify.ts`
- Test: `src/lib/email/templates.test.ts`

**Interfaces:**
- Produces: `sendEmail(msg): Promise<SendResult>`; `escapeHtml(s)`; `enquiryNotification(row, siteUrl)` and `registrationNotification(row, siteUrl)` returning `{ subject, html, text }`; `notifyEnquiry(id)` and `notifyRegistration(id)` which never throw.

- [ ] **Step 1: Write the failing template test** — `src/lib/email/templates.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { enquiryNotification, escapeHtml, registrationNotification } from "@/lib/email/templates";
import type { EnquiryRow, RegistrationRow } from "@/lib/db/schema";

const now = new Date("2026-10-13T10:00:00Z");
const enquiry: EnquiryRow = {
  id: 5, enquiryType: "individual", name: "Jane <b>Doe</b>", email: "jane@example.com", role: "parent",
  organisation: null, contactMethod: "email", phone: null, ageGroup: "15-18", level: "school", groupSize: null,
  location: "Auckland", timing: "asap", message: "<script>alert(1)</script> Keen to start", workshopTopics: [],
  consentContact: true, sourcePage: "/", submittedAt: now, status: "new", adminNotes: null, notifiedAt: null,
  notifyError: null, createdAt: now,
};
const registration: RegistrationRow = {
  id: 9, role: "A player", level: "Club", experience: "2 to 5 years", focusAreas: ["Throwing accuracy", "Leadership"],
  goal: null, name: "Sam", email: "sam@example.com", phone: null, location: "Wellington, NZ", privacyAccepted: true,
  acceptedAt: now, status: "new", adminNotes: null, notifiedAt: null, notifyError: null, createdAt: now,
};

describe("escapeHtml", () => {
  it("escapes the five HTML characters", () => {
    expect(escapeHtml(`<a href="x">&'</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;");
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
  });
});

describe("registrationNotification", () => {
  const mail = registrationNotification(registration, "https://thehookerlab.co.nz");
  it("lists focus areas", () => {
    expect(mail.text).toContain("Throwing accuracy, Leadership");
    expect(mail.html).toContain("/admin/registrations/9");
  });
});
```

- [ ] **Step 2: Run it** — Expected: FAIL, module not found.

- [ ] **Step 3: Create `src/lib/email/templates.ts`**

```ts
import type { EnquiryRow, RegistrationRow } from "@/lib/db/schema";

export type Mail = { subject: string; html: string; text: string };

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

type Line = [label: string, value: string | null | undefined];

function render(title: string, lines: Line[], message: string | null, link: string): Mail {
  const rows = lines.filter(([, v]) => v);
  const text = [
    title, "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(message ? ["", "Message:", message] : []),
    "", `Open in admin: ${link}`,
  ].join("\n");
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
<h2 style="margin:0 0 16px">${escapeHtml(title)}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${rows.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v as string)}</td></tr>`).join("\n")}
</table>
${message ? `<p style="margin:16px 0 4px;color:#666">Message</p><p style="white-space:pre-wrap;margin:0">${escapeHtml(message)}</p>` : ""}
<p style="margin-top:24px"><a href="${escapeHtml(link)}">Open in admin</a></p>
</body></html>`;
  return { subject: title, html, text };
}

export function enquiryNotification(row: EnquiryRow, siteUrl: string): Mail {
  return render(
    `New enquiry from ${row.name} (${row.enquiryType})`,
    [
      ["Name", row.name], ["Email", row.email], ["Role", row.role], ["Organisation", row.organisation],
      ["Preferred contact", row.contactMethod], ["Phone", row.phone], ["Age group", row.ageGroup],
      ["Level", row.level], ["Group size", row.groupSize], ["Location", row.location], ["Timing", row.timing],
      ["Workshop topics", row.workshopTopics.length ? row.workshopTopics.join(", ") : null],
      ["Sent from", row.sourcePage], ["Submitted", row.submittedAt.toISOString()],
    ],
    row.message,
    `${siteUrl}/admin/enquiries/${row.id}`,
  );
}

export function registrationNotification(row: RegistrationRow, siteUrl: string): Mail {
  return render(
    `New online programme registration from ${row.name}`,
    [
      ["Name", row.name], ["Email", row.email], ["Phone", row.phone], ["Location", row.location],
      ["Registering as", row.role], ["Level", row.level], ["Hooker experience", row.experience],
      ["Focus areas", row.focusAreas.length ? row.focusAreas.join(", ") : null],
      ["Submitted", row.acceptedAt.toISOString()],
    ],
    row.goal,
    `${siteUrl}/admin/registrations/${row.id}`,
  );
}
```

- [ ] **Step 4: Run it** — Expected: 5 passed.

- [ ] **Step 5: Create `src/lib/email/resend.ts`**

```ts
import "server-only";
import { Resend } from "resend";

export type SendResult = { ok: true; id: string | null } | { ok: false; error: string };

export type OutgoingMail = {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(mail: OutgoingMail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] RESEND_API_KEY not set; would send:", { to: mail.to, subject: mail.subject });
    }
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from: mail.from, to: mail.to, replyTo: mail.replyTo, subject: mail.subject, html: mail.html, text: mail.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
```

Check the installed `resend` type for the reply-to field name (`replyTo` in v4+; older used `reply_to`) by opening `node_modules/resend/dist/index.d.ts` and searching for `replyTo`.

- [ ] **Step 6: Create `src/lib/email/notify.ts`**

```ts
import "server-only";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { enquiries, registrations, siteSettings } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";
import { sendEmail } from "./resend";
import { enquiryNotification, registrationNotification, type Mail } from "./templates";

async function deliver(mail: Mail, replyTo: string) {
  const [settings] = await getDb().select().from(siteSettings).where(eq(siteSettings.id, 1));
  if (!settings) return { ok: false as const, error: "site_settings missing" };
  return sendEmail({
    from: `${settings.fromName} <${settings.fromEmail}>`,
    to: settings.notificationEmail,
    replyTo,
    ...mail,
  });
}

export async function notifyEnquiry(id: number): Promise<void> {
  const db = getDb();
  try {
    const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id));
    if (!row) return;
    const result = await deliver(enquiryNotification(row, SITE_URL), row.email);
    await db.update(enquiries)
      .set(result.ok ? { notifiedAt: new Date(), notifyError: null } : { notifyError: result.error })
      .where(eq(enquiries.id, id));
  } catch (err) {
    console.error("[email] notifyEnquiry failed", err);
  }
}

export async function notifyRegistration(id: number): Promise<void> {
  const db = getDb();
  try {
    const [row] = await db.select().from(registrations).where(eq(registrations.id, id));
    if (!row) return;
    const result = await deliver(registrationNotification(row, SITE_URL), row.email);
    await db.update(registrations)
      .set(result.ok ? { notifiedAt: new Date(), notifyError: null } : { notifyError: result.error })
      .where(eq(registrations.id, id));
  } catch (err) {
    console.error("[email] notifyRegistration failed", err);
  }
}
```

- [ ] **Step 7: Type-check and commit**

```bash
git add src/lib/email
git commit -m "feat(email): add resend client, notification templates and notify helpers"
```

### Task 16: Public form schemas and route handlers

**Files:**
- Create: `src/lib/forms/enquiry-schema.ts`, `src/lib/forms/registration-schema.ts`, `src/app/api/enquiry/route.ts`, `src/app/api/online-registrations/route.ts`, `src/lib/forms/http.ts`
- Test: `src/lib/forms/enquiry-schema.test.ts`, `src/lib/forms/registration-schema.test.ts`

**Interfaces:**
- Produces: `enquirySchema` (parses the `EnquiryPayload` shape from `src/lib/enquiry.ts`), `registrationSchema` (parses `OnlineRegistration` from `src/lib/registration.ts`), `readJson(req, maxBytes)` returning `{ ok: true, body } | { ok: false, response }`.

- [ ] **Step 1: Write the failing enquiry schema test** — `src/lib/forms/enquiry-schema.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { enquirySchema } from "@/lib/forms/enquiry-schema";

const valid = {
  enquiryType: "individual", workshopTopics: [], name: "Jane Doe", email: "jane@example.com", role: "parent",
  organisation: "", contactMethod: "email", phone: "", ageGroup: "", level: "", groupSize: "", location: "",
  timing: "", message: "Keen to start coaching soon", consentContact: true, updatesOnline: false, website: "",
  source: { page: "/", submittedAt: "2026-10-13T10:00:00.000Z" },
};

describe("enquirySchema", () => {
  it("accepts a valid payload", () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });
  it("requires an organisation for school, club, academy and union roles", () => {
    const r = enquirySchema.safeParse({ ...valid, role: "school" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].path).toEqual(["organisation"]);
    expect(enquirySchema.safeParse({ ...valid, role: "school", organisation: "Kings" }).success).toBe(true);
  });
  it("requires a phone when the contact method is not email", () => {
    expect(enquirySchema.safeParse({ ...valid, contactMethod: "whatsapp" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, contactMethod: "whatsapp", phone: "+64 21 123 4567" }).success).toBe(true);
  });
  it("rejects a short message, missing consent and unknown enquiry type", () => {
    expect(enquirySchema.safeParse({ ...valid, message: "hi" }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, consentContact: false }).success).toBe(false);
    expect(enquirySchema.safeParse({ ...valid, enquiryType: "nope" }).success).toBe(false);
  });
  it("caps the message length at MESSAGE_MAX", () => {
    expect(enquirySchema.safeParse({ ...valid, message: "x".repeat(1501) }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Create `src/lib/forms/enquiry-schema.ts`**

```ts
import { z } from "zod";

import { contact } from "@/data/contact";
import { MESSAGE_MAX } from "@/lib/enquiry";

const ids = (list: { id: string }[]) => list.map((o) => o.id) as [string, ...string[]];
const optionalId = (list: { id: string }[]) => z.enum(ids(list)).or(z.literal(""));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
    ageGroup: optionalId(contact.ageGroups).default(""),
    level: optionalId(contact.levels).default(""),
    groupSize: optionalId(contact.groupSizes).default(""),
    location: z.string().trim().max(120).default(""),
    timing: optionalId(contact.timings).default(""),
    message: z.string().trim().min(15).max(MESSAGE_MAX),
    consentContact: z.literal(true),
    updatesOnline: z.boolean().default(false),
    website: z.string().max(200).default(""),
    source: z.object({ page: z.string().max(200), submittedAt: z.string().datetime() }),
  })
  .superRefine((v, ctx) => {
    if (contact.orgRoles.includes(v.role) && v.organisation.length < 2) {
      ctx.addIssue({ code: "custom", path: ["organisation"], message: "Organisation is required for this role" });
    }
    const digits = v.phone.replace(/\D/g, "");
    if (v.contactMethod !== "email" && !v.phone) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Phone is required for WhatsApp or phone contact" });
    } else if (v.phone && (digits.length < 7 || digits.length > 15 || /[^\d+()\s-]/.test(v.phone))) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: "Enter a valid phone number" });
    }
  });

export type EnquiryInput = z.infer<typeof enquirySchema>;
```

- [ ] **Step 3: Run it** — Expected: 5 passed.

- [ ] **Step 4: Write the failing registration schema test** — `src/lib/forms/registration-schema.test.ts`

```ts
import { describe, expect, it } from "vitest";
import { registrationSchema } from "@/lib/forms/registration-schema";

const valid = {
  role: "A player", level: "Club", experience: "2 to 5 years", focusAreas: ["Throwing accuracy"], goal: "",
  name: "Sam", email: "sam@example.com", phone: "", location: "Wellington, New Zealand", privacyAccepted: true,
  acceptedAt: "2026-10-13T10:00:00.000Z", source: "online-programme",
};

describe("registrationSchema", () => {
  it("accepts a valid payload", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });
  it("requires privacy acceptance", () => {
    expect(registrationSchema.safeParse({ ...valid, privacyAccepted: false }).success).toBe(false);
  });
  it("only accepts the listed options", () => {
    expect(registrationSchema.safeParse({ ...valid, role: "Alien" }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...valid, focusAreas: ["Juggling"] }).success).toBe(false);
  });
  it("treats missing optional fields as empty strings", () => {
    const r = registrationSchema.safeParse({ ...valid, goal: undefined, phone: undefined });
    expect(r.success && r.data.goal).toBe("");
  });
});
```

- [ ] **Step 5: Create `src/lib/forms/registration-schema.ts`**

```ts
import { z } from "zod";

import { registerSteps } from "@/data/online";

const optionsOf = (id: string) => {
  const step = registerSteps.find((s) => s.id === id);
  if (!step || !("options" in step)) throw new Error(`register step ${id} has no options`);
  return step.options as unknown as [string, ...string[]];
};

export const registrationSchema = z.object({
  role: z.enum(optionsOf("role")),
  level: z.enum(optionsOf("level")),
  experience: z.enum(optionsOf("experience")),
  focusAreas: z.array(z.enum(optionsOf("focus"))).max(20).default([]),
  goal: z.string().trim().max(600).default(""),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).default(""),
  location: z.string().trim().min(1).max(120),
  privacyAccepted: z.literal(true),
  acceptedAt: z.string().datetime(),
  source: z.literal("online-programme"),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
```

- [ ] **Step 6: Run all tests** — Expected: all pass.

- [ ] **Step 7: Create `src/lib/forms/http.ts`**

```ts
import { NextResponse } from "next/server";

export async function readJson(req: Request, maxBytes = 32_000) {
  if (!req.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return { ok: false as const, response: NextResponse.json({ error: "Expected JSON" }, { status: 415 }) };
  }
  const text = await req.text();
  if (text.length > maxBytes) {
    return { ok: false as const, response: NextResponse.json({ error: "Payload too large" }, { status: 413 }) };
  }
  try {
    return { ok: true as const, body: JSON.parse(text) as unknown };
  } catch {
    return { ok: false as const, response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) };
  }
}
```

- [ ] **Step 8: Create `src/app/api/enquiry/route.ts`**

```ts
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db/client";
import { enquiries } from "@/lib/db/schema";
import { notifyEnquiry } from "@/lib/email/notify";
import { enquirySchema } from "@/lib/forms/enquiry-schema";
import { readJson } from "@/lib/forms/http";
import { zodErrors } from "@/lib/admin/form";

export async function POST(req: Request) {
  const read = await readJson(req);
  if (!read.ok) return read.response;

  const honeypot = (read.body as { website?: unknown })?.website;
  if (typeof honeypot === "string" && honeypot.trim()) return NextResponse.json({ ok: true }, { status: 200 });

  const parsed = enquirySchema.safeParse(read.body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid enquiry", errors: zodErrors(parsed.error) }, { status: 400 });
  const d = parsed.data;
  const blank = (s: string) => (s ? s : null);

  let id: number;
  try {
    const [row] = await getDb().insert(enquiries).values({
      enquiryType: d.enquiryType, name: d.name, email: d.email, role: d.role, organisation: blank(d.organisation),
      contactMethod: d.contactMethod, phone: blank(d.phone), ageGroup: blank(d.ageGroup), level: blank(d.level),
      groupSize: blank(d.groupSize), location: blank(d.location), timing: blank(d.timing), message: d.message,
      workshopTopics: d.workshopTopics, consentContact: d.consentContact, sourcePage: d.source.page,
      submittedAt: new Date(d.source.submittedAt),
    }).returning({ id: enquiries.id });
    id = row.id;
  } catch (err) {
    console.error("[api/enquiry] insert failed", err);
    return NextResponse.json({ error: "Could not save your enquiry" }, { status: 500 });
  }

  await notifyEnquiry(id);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
```

- [ ] **Step 9: Create `src/app/api/online-registrations/route.ts`**

```ts
import { NextResponse } from "next/server";

import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { notifyRegistration } from "@/lib/email/notify";
import { readJson } from "@/lib/forms/http";
import { registrationSchema } from "@/lib/forms/registration-schema";
import { zodErrors } from "@/lib/admin/form";

export async function POST(req: Request) {
  const read = await readJson(req);
  if (!read.ok) return read.response;

  const parsed = registrationSchema.safeParse(read.body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid registration", errors: zodErrors(parsed.error) }, { status: 400 });
  const d = parsed.data;

  let id: number;
  try {
    const [row] = await getDb().insert(registrations).values({
      role: d.role, level: d.level, experience: d.experience, focusAreas: d.focusAreas, goal: d.goal || null,
      name: d.name, email: d.email, phone: d.phone || null, location: d.location, privacyAccepted: d.privacyAccepted,
      acceptedAt: new Date(d.acceptedAt),
    }).returning({ id: registrations.id });
    id = row.id;
  } catch (err) {
    console.error("[api/online-registrations] insert failed", err);
    return NextResponse.json({ error: "Could not save your registration" }, { status: 500 });
  }

  await notifyRegistration(id);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
```

- [ ] **Step 10: Verify** — with `NEXT_PUBLIC_ENQUIRY_MOCK` unset, submit the contact form on `/` and the registration dialog from the Services section. Both show their success state; both rows appear in Neon (`npm run db:studio`); without `RESEND_API_KEY` the rows have `notify_error = "RESEND_API_KEY not set"`. Then:

```bash
curl -s -X POST http://localhost:3000/api/enquiry -H "content-type: application/json" -d "{}" 
```

Expected: 400 with an `errors` object. Posting with `-H "content-type: text/plain"` returns 415.

- [ ] **Step 11: Commit**

```bash
git add src/lib/forms src/app/api
git commit -m "feat(api): store and notify contact enquiries and online registrations"
```

### Task 17: Inbox actions and pages

**Files:**
- Create: `src/lib/admin/actions/inbox.ts`, `src/components/admin/InboxDetail.tsx`, `src/app/admin/(panel)/enquiries/page.tsx`, `src/app/admin/(panel)/enquiries/[id]/page.tsx`, `src/app/admin/(panel)/registrations/page.tsx`, `src/app/admin/(panel)/registrations/[id]/page.tsx`

**Interfaces:**
- Produces: `InboxKind = "enquiry" | "registration"`; `setInboxStatus(kind, id, status)`, `saveInboxNotes(kind, id, prev, formData)`, `resendNotification(kind, id)`; `InboxDetail({ kind, id, status, notes, notifiedAt, notifyError, fields })`.

- [ ] **Step 1: Create `src/lib/admin/actions/inbox.ts`**

```ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { enquiries, registrations, type InboxStatus } from "@/lib/db/schema";
import { notifyEnquiry, notifyRegistration } from "@/lib/email/notify";
import { fail, formObject, ok, zodErrors, type ActionState } from "@/lib/admin/form";
import { notesSchema, statusSchema } from "@/lib/admin/schemas";

export type InboxKind = "enquiry" | "registration";

const tableFor = (kind: InboxKind) => (kind === "enquiry" ? enquiries : registrations);
const pathFor = (kind: InboxKind) => (kind === "enquiry" ? "/admin/enquiries" : "/admin/registrations");

export async function setInboxStatus(kind: InboxKind, id: number, status: InboxStatus): Promise<void> {
  await requireAdmin();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return;
  const table = tableFor(kind);
  await getDb().update(table).set({ status: parsed.data }).where(eq(table.id, id));
  revalidatePath(pathFor(kind), "layout");
}

export async function saveInboxNotes(kind: InboxKind, id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = notesSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error));
  const table = tableFor(kind);
  await getDb().update(table).set({ adminNotes: parsed.data.notes || null }).where(eq(table.id, id));
  return ok("Notes saved.");
}

export async function resendNotification(kind: InboxKind, id: number): Promise<void> {
  await requireAdmin();
  if (kind === "enquiry") await notifyEnquiry(id);
  else await notifyRegistration(id);
  revalidatePath(`${pathFor(kind)}/${id}`);
}
```

Admin pages are dynamic, so `revalidatePath` here only refreshes the router cache for the current client; it is enough for the status badge and the resend result to update after the transition.

- [ ] **Step 2: Create `src/components/admin/InboxDetail.tsx`** (client)

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";

import { resendNotification, saveInboxNotes, setInboxStatus, type InboxKind } from "@/lib/admin/actions/inbox";
import { initialState } from "@/lib/admin/form";
import { INBOX_STATUSES, type InboxStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Field, Panel, inputClass } from "./fields";
import StatusBadge from "./StatusBadge";
import SubmitButton from "./SubmitButton";

type Props = {
  kind: InboxKind;
  id: number;
  status: string;
  notes: string | null;
  notifiedAt: Date | null;
  notifyError: string | null;
  fields: [label: string, value: string | null][];
  message: { label: string; value: string | null };
};

export default function InboxDetail({ kind, id, status, notes, notifiedAt, notifyError, fields, message }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, notesAction] = useActionState(saveInboxNotes.bind(null, kind, id), initialState);

  const act = (fn: () => Promise<void>) => start(async () => { await fn(); router.refresh(); });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Panel>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {fields.filter(([, v]) => v).map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-[0.28em] text-mist">{k}</dt>
              <dd className="mt-1 text-sm">{v}</dd>
            </div>
          ))}
        </dl>
        {message.value && (
          <div className="mt-6 border-t border-line pt-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mist">{message.label}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{message.value}</p>
          </div>
        )}
      </Panel>

      <div className="space-y-6">
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INBOX_STATUSES.map((s: InboxStatus) => (
              <button
                key={s}
                type="button"
                disabled={pending || s === status}
                onClick={() => act(() => setInboxStatus(kind, id, s))}
                className={cn("rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]", s === status ? "border-bone bg-bone text-ink" : "border-line text-mist hover:text-bone")}
              >
                {s}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">Notification email</p>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={notifiedAt ? "read" : "new"} />
            <span className="text-sm">{notifiedAt ? `Sent ${notifiedAt.toLocaleString("en-NZ")}` : "Not sent"}</span>
          </div>
          {notifyError && <p className="mt-2 text-xs text-accent">{notifyError}</p>}
          <button
            type="button"
            disabled={pending}
            onClick={() => act(() => resendNotification(kind, id))}
            className="mt-4 rounded-full border border-line px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-mist hover:text-bone disabled:opacity-60"
          >
            {notifiedAt ? "Send again" : "Resend now"}
          </button>
        </Panel>

        <Panel>
          <form action={notesAction} className="space-y-4">
            <Field label="Private notes" error={state.status === "error" ? state.errors.notes : undefined}>
              <textarea name="notes" rows={5} defaultValue={notes ?? ""} className={inputClass} />
            </Field>
            {state.status === "success" && <p className="text-xs text-mist">{state.message}</p>}
            <SubmitButton>Save notes</SubmitButton>
          </form>
        </Panel>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create the enquiries list `src/app/admin/(panel)/enquiries/page.tsx`**

```tsx
import Link from "next/link";
import { desc, eq } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { getDb } from "@/lib/db/client";
import { INBOX_STATUSES, enquiries } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = INBOX_STATUSES.find((s) => s === status);
  const q = getDb().select().from(enquiries).orderBy(desc(enquiries.id)).limit(200);
  const rows = await (filter ? q.where(eq(enquiries.status, filter)) : q);

  return (
    <>
      <PageHeader title="Enquiries" description="Messages from the contact form." />
      <div className="mb-6 flex gap-2">
        {[undefined, ...INBOX_STATUSES].map((s) => (
          <Link key={s ?? "all"} href={s ? `/admin/enquiries?status=${s}` : "/admin/enquiries"}
            className={cn("rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]", s === filter ? "border-bone bg-bone text-ink" : "border-line text-mist hover:text-bone")}>
            {s ?? "all"}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-[1.25rem] border border-dashed border-line p-8 text-center text-sm text-mist">No enquiries.</p>
      ) : (
        <ul className="divide-y divide-line rounded-[1.25rem] border border-line bg-coal">
          {rows.map((e) => (
            <li key={e.id}>
              <Link href={`/admin/enquiries/${e.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-steel/40">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.name} <span className="text-mist">· {e.email}</span></p>
                  <p className="truncate text-xs text-mist">{e.enquiryType} · {e.submittedAt.toLocaleString("en-NZ")}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {e.notifyError && <StatusBadge status="new" />}
                  <StatusBadge status={e.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
```

Replace the `{e.notifyError && <StatusBadge status="new" />}` line with a small red "email failed" badge: `<span className="rounded-full border border-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-accent">email failed</span>`.

- [ ] **Step 4: Create the enquiry detail `src/app/admin/(panel)/enquiries/[id]/page.tsx`**

```tsx
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import InboxDetail from "@/components/admin/InboxDetail";
import PageHeader from "@/components/admin/PageHeader";
import { getDb } from "@/lib/db/client";
import { enquiries } from "@/lib/db/schema";
import { setInboxStatus } from "@/lib/admin/actions/inbox";

export default async function EnquiryPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await getDb().select().from(enquiries).where(eq(enquiries.id, id));
  if (!row) notFound();
  if (row.status === "new") {
    await setInboxStatus("enquiry", id, "read");
    row.status = "read";
  }

  return (
    <>
      <PageHeader title={row.name} description={`${row.enquiryType} · ${row.submittedAt.toLocaleString("en-NZ")}`} />
      <InboxDetail
        kind="enquiry"
        id={row.id}
        status={row.status}
        notes={row.adminNotes}
        notifiedAt={row.notifiedAt}
        notifyError={row.notifyError}
        message={{ label: "Message", value: row.message }}
        fields={[
          ["Email", row.email], ["Role", row.role], ["Organisation", row.organisation],
          ["Preferred contact", row.contactMethod], ["Phone", row.phone], ["Age group", row.ageGroup],
          ["Level", row.level], ["Group size", row.groupSize], ["Location", row.location], ["Timing", row.timing],
          ["Workshop topics", row.workshopTopics.join(", ") || null], ["Sent from", row.sourcePage],
        ]}
      />
    </>
  );
}
```

Calling a server action during render is not allowed; instead do the "mark as read" write directly: `await getDb().update(enquiries).set({ status: "read" }).where(eq(enquiries.id, id))`. Remove the `setInboxStatus` import.

- [ ] **Step 5: Create the registrations list and detail** — copies of the two enquiry pages with `registrations`, `kind="registration"`, hrefs under `/admin/registrations`, list subtitle `${r.level} · ${r.acceptedAt.toLocaleString("en-NZ")}`, and detail fields:

```tsx
message={{ label: "Main goal", value: row.goal }}
fields={[
  ["Email", row.email], ["Phone", row.phone], ["Location", row.location], ["Registering as", row.role],
  ["Level", row.level], ["Hooker experience", row.experience], ["Focus areas", row.focusAreas.join(", ") || null],
]}
```

- [ ] **Step 6: Verify** — open the enquiry submitted in Task 16; it flips to "read"; archive it; the filter chips work; save a note; press "Resend now" and see the error text update (or, with a real `RESEND_API_KEY` and verified sender, see "Sent …" and receive the email). Dashboard counts match. `npx tsc --noEmit` clean, `npm run lint` clean.

- [ ] **Step 7: Commit**

```bash
git add src/lib/admin/actions/inbox.ts src/components/admin/InboxDetail.tsx "src/app/admin/(panel)/enquiries" "src/app/admin/(panel)/registrations"
git commit -m "feat(admin): enquiry and registration inboxes with status, notes and resend"
```

### Task 18: Docs, production build and final verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace `README.md`** with project-specific instructions

```markdown
# The Hooker Lab

Marketing site with an admin panel. Next.js 16, Tailwind 4, Drizzle ORM on Neon Postgres, Resend for email.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in (see comments in the file).
3. `npm run db:migrate` — applies migrations in `drizzle/`.
4. `npm run db:seed` — creates settings, section copy, the first admin (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`) and the initial content. Safe to run again.
5. `npm run dev` and open http://localhost:3000. The admin is at http://localhost:3000/admin.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | vitest unit tests |
| `npm run db:generate` | generate a migration after editing `src/lib/db/schema.ts` |
| `npm run db:migrate` | apply migrations |
| `npm run db:seed` | idempotent seed |
| `npm run db:studio` | Drizzle Studio |

## How content flows

Public pages read through cached functions in `src/lib/content/queries.ts`, tagged per content type. Admin server actions in `src/lib/admin/actions/` write to Postgres and call `updateTag`, so edits appear immediately. If the database is unreachable in production, the public site falls back to the static content in `src/data/`.

## Deploying to Vercel

Set every variable from `.env.example` in the Vercel project. `DATABASE_URL` is needed at build time because content is prerendered. Run `npm run db:migrate` against production before deploying a schema change; the build does not run migrations.

## Pricing

A programme price shows on the site only when Settings → "Show programme prices" is on **and** the programme's own "Show price" switch is on **and** a price is set.
```

- [ ] **Step 2: Full verification**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: tests green, no type errors, no lint errors, build completes with `/`, `/faq` and the legal pages prerendered and `/admin/*` dynamic.

- [ ] **Step 3: Manual checklist** (from the spec)

- [ ] Seed, sign in, sign out; `/admin` redirects to login when signed out.
- [ ] Edit a programme, pillar skill, testimonial, FAQ and a section heading; each appears on the public page on the next load.
- [ ] Pricing shows only with both switches on and a price set.
- [ ] Contact form and registration dialog both succeed; rows in the inboxes; notification status visible.
- [ ] Change the admin password and sign in with it.
- [ ] Mobile width: admin drawer opens and closes; public pages unchanged.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: describe setup, scripts, content flow and deployment"
```


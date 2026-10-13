import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { count, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

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

async function isEmpty(table: PgTable) {
  const [row] = await getDb().select({ n: count() }).from(table);
  return Number(row.n) === 0;
}

async function main() {
  const db = getDb();
  const log = (m: string) => console.log(`[seed] ${m}`);

  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  if (!settings) {
    await db.insert(siteSettings).values(seedSettings);
    log("site_settings created");
  }

  for (const key of SECTION_KEYS) {
    const [row] = await db
      .select()
      .from(sectionCopy)
      .where(eq(sectionCopy.key, key));
    if (!row) {
      await db.insert(sectionCopy).values({ key, ...seedSectionCopy[key] });
      log(`section_copy.${key} created`);
    }
  }

  if (await isEmpty(adminUsers)) {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the first admin",
      );
    }
    await db.insert(adminUsers).values({
      email,
      name: "Admin",
      passwordHash: await hashPassword(password),
    });
    log(`admin ${email} created`);
  }

  if (await isEmpty(programs)) {
    await db.insert(programs).values(seedPrograms);
    log(`${seedPrograms.length} programmes inserted`);
  }

  if (await isEmpty(expertisePillars)) {
    for (const { skills, ...pillar } of seedPillars) {
      const [inserted] = await db
        .insert(expertisePillars)
        .values(pillar)
        .returning({ id: expertisePillars.id });
      await db
        .insert(expertiseSkills)
        .values(skills.map((s) => ({ ...s, pillarId: inserted.id })));
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

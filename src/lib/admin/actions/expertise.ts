"use server";

import { eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { fail, formObject, zodErrors, type ActionState } from "@/lib/admin/form";
import type { Direction } from "@/lib/admin/reorder";
import { pillarSchema } from "@/lib/admin/schemas";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/tags";
import { getDb } from "@/lib/db/client";
import { expertisePillars, expertiseSkills } from "@/lib/db/schema";
import { moveRow, nextSortOrder } from "./shared";

const LIST = "/admin/expertise";

/* Saves the pillar and replaces its skills wholesale, in one transaction. */
export async function savePillar(
  id: number | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = pillarSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  }
  const { skills, ...data } = parsed.data;
  const db = getDb();

  const others = await db
    .select({ slug: expertisePillars.slug })
    .from(expertisePillars)
    .where(id ? ne(expertisePillars.id, id) : undefined);
  const slug = uniqueSlug(
    data.slug || slugify(data.word),
    others.map((o) => o.slug),
  );
  const values = { ...data, slug, updatedAt: new Date() };
  const sortOrder = id ? null : await nextSortOrder(expertisePillars);

  await db.transaction(async (tx) => {
    let pillarId = id;
    if (pillarId) {
      await tx
        .update(expertisePillars)
        .set(values)
        .where(eq(expertisePillars.id, pillarId));
      await tx
        .delete(expertiseSkills)
        .where(eq(expertiseSkills.pillarId, pillarId));
    } else {
      const [row] = await tx
        .insert(expertisePillars)
        .values({ ...values, sortOrder: sortOrder ?? 0 })
        .returning({ id: expertisePillars.id });
      pillarId = row.id;
    }
    const owner = pillarId;
    await tx
      .insert(expertiseSkills)
      .values(skills.map((s, i) => ({ ...s, pillarId: owner, sortOrder: i })));
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

export async function movePillar(
  id: number,
  direction: Direction,
): Promise<void> {
  await requireAdmin();
  await moveRow(expertisePillars, id, direction);
  updateTag(TAGS.expertise);
}

export async function togglePillar(
  id: number,
  published: boolean,
): Promise<void> {
  await requireAdmin();
  await getDb()
    .update(expertisePillars)
    .set({ published, updatedAt: new Date() })
    .where(eq(expertisePillars.id, id));
  updateTag(TAGS.expertise);
}

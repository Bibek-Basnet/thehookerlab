"use server";

import { eq, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { fail, formObject, zodErrors, type ActionState } from "@/lib/admin/form";
import type { Direction } from "@/lib/admin/reorder";
import { programSchema } from "@/lib/admin/schemas";
import { slugify, uniqueSlug } from "@/lib/admin/slug";
import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/tags";
import { getDb } from "@/lib/db/client";
import { programs } from "@/lib/db/schema";
import { moveRow, nextSortOrder } from "./shared";

const LIST = "/admin/programmes";

export async function saveProgram(
  id: number | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = programSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  }
  const data = parsed.data;
  const db = getDb();

  const others = await db
    .select({ slug: programs.slug })
    .from(programs)
    .where(id ? ne(programs.id, id) : undefined);
  const slug = uniqueSlug(
    data.slug || slugify(data.title),
    others.map((o) => o.slug),
  );

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
    await db
      .insert(programs)
      .values({ ...values, sortOrder: await nextSortOrder(programs) });
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

export async function moveProgram(
  id: number,
  direction: Direction,
): Promise<void> {
  await requireAdmin();
  await moveRow(programs, id, direction);
  updateTag(TAGS.programs);
}

export async function toggleProgram(
  id: number,
  published: boolean,
): Promise<void> {
  await requireAdmin();
  await getDb()
    .update(programs)
    .set({ published, updatedAt: new Date() })
    .where(eq(programs.id, id));
  updateTag(TAGS.programs);
}

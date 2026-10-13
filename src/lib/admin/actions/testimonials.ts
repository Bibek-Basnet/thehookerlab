"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { fail, formObject, zodErrors, type ActionState } from "@/lib/admin/form";
import type { Direction } from "@/lib/admin/reorder";
import { testimonialSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/tags";
import { getDb } from "@/lib/db/client";
import { testimonials } from "@/lib/db/schema";
import { moveRow, nextSortOrder } from "./shared";

const LIST = "/admin/testimonials";

export async function saveTestimonial(
  id: number | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  }
  const values = { ...parsed.data, updatedAt: new Date() };
  const db = getDb();
  if (id) {
    await db.update(testimonials).set(values).where(eq(testimonials.id, id));
  } else {
    await db
      .insert(testimonials)
      .values({ ...values, sortOrder: await nextSortOrder(testimonials) });
  }
  updateTag(TAGS.testimonials);
  redirect(`${LIST}?saved=1`);
}

export async function deleteTestimonial(id: number): Promise<void> {
  await requireAdmin();
  await getDb().delete(testimonials).where(eq(testimonials.id, id));
  updateTag(TAGS.testimonials);
  redirect(`${LIST}?saved=deleted`);
}

export async function moveTestimonial(
  id: number,
  direction: Direction,
): Promise<void> {
  await requireAdmin();
  await moveRow(testimonials, id, direction);
  updateTag(TAGS.testimonials);
}

export async function toggleTestimonial(
  id: number,
  published: boolean,
): Promise<void> {
  await requireAdmin();
  await getDb()
    .update(testimonials)
    .set({ published, updatedAt: new Date() })
    .where(eq(testimonials.id, id));
  updateTag(TAGS.testimonials);
}

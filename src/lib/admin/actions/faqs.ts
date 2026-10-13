"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { fail, formObject, zodErrors, type ActionState } from "@/lib/admin/form";
import type { Direction } from "@/lib/admin/reorder";
import { faqSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/tags";
import { getDb } from "@/lib/db/client";
import { faqs } from "@/lib/db/schema";
import { moveRow, nextSortOrder } from "./shared";

const LIST = "/admin/faq";

export async function saveFaq(
  id: number | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = faqSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  }
  const values = { ...parsed.data, updatedAt: new Date() };
  const db = getDb();
  if (id) {
    await db.update(faqs).set(values).where(eq(faqs.id, id));
  } else {
    await db
      .insert(faqs)
      .values({ ...values, sortOrder: await nextSortOrder(faqs) });
  }
  updateTag(TAGS.faqs);
  redirect(`${LIST}?saved=1`);
}

export async function deleteFaq(id: number): Promise<void> {
  await requireAdmin();
  await getDb().delete(faqs).where(eq(faqs.id, id));
  updateTag(TAGS.faqs);
  redirect(`${LIST}?saved=deleted`);
}

export async function moveFaq(id: number, direction: Direction): Promise<void> {
  await requireAdmin();
  await moveRow(faqs, id, direction);
  updateTag(TAGS.faqs);
}

export async function toggleFaq(id: number, published: boolean): Promise<void> {
  await requireAdmin();
  await getDb()
    .update(faqs)
    .set({ published, updatedAt: new Date() })
    .where(eq(faqs.id, id));
  updateTag(TAGS.faqs);
}

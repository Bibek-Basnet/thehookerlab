"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";

import {
  fail,
  formObject,
  ok,
  zodErrors,
  type ActionState,
} from "@/lib/admin/form";
import { sectionSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/tags";
import { getDb } from "@/lib/db/client";
import { sectionCopy } from "@/lib/db/schema";

const nullable = (v: string) => (v === "" ? null : v);

export async function saveSection(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = sectionSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  }
  const { key, ...data } = parsed.data;
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

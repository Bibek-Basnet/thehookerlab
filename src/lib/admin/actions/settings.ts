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
import { settingsSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/dal";
import { TAGS } from "@/lib/content/tags";
import { getDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";

export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  }
  await getDb()
    .update(siteSettings)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(siteSettings.id, 1));
  updateTag(TAGS.settings);
  return ok("Settings saved.");
}

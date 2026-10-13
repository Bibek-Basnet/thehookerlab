"use server";

import { eq } from "drizzle-orm";

import {
  fail,
  formObject,
  ok,
  zodErrors,
  type ActionState,
} from "@/lib/admin/form";
import { accountSchema, passwordSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/dal";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";

export async function saveAccount(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = accountSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  }
  const db = getDb();
  const [clash] = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, parsed.data.email))
    .limit(1);
  if (clash && clash.id !== user.id) {
    return fail({ email: "That email is already in use." });
  }
  await db
    .update(adminUsers)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(adminUsers.id, user.id));
  return ok("Account updated.");
}

export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireAdmin();
  const parsed = passwordSchema.safeParse(formObject(formData));
  if (!parsed.success) {
    return fail(zodErrors(parsed.error), "Check the highlighted fields.");
  }
  const db = getDb();
  const [row] = await db
    .select({ hash: adminUsers.passwordHash })
    .from(adminUsers)
    .where(eq(adminUsers.id, user.id));
  if (!row || !(await verifyPassword(parsed.data.currentPassword, row.hash))) {
    return fail({ currentPassword: "Current password is incorrect." });
  }
  await db
    .update(adminUsers)
    .set({
      passwordHash: await hashPassword(parsed.data.newPassword),
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, user.id));
  return ok("Password changed.");
}

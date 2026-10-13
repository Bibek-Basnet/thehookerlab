"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { fail, formObject, type ActionState } from "@/lib/admin/form";
import { loginSchema } from "@/lib/admin/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { adminUsers } from "@/lib/db/schema";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail({}, "Enter your email and password.");

  const [user] = await getDb()
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, parsed.data.email));
  const valid = user
    ? await verifyPassword(parsed.data.password, user.passwordHash)
    : false;
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

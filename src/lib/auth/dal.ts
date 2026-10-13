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

/* Every admin page and server action calls this first. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getCurrentAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

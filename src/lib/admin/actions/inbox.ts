"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import {
  fail,
  formObject,
  ok,
  zodErrors,
  type ActionState,
} from "@/lib/admin/form";
import { notesSchema, statusSchema } from "@/lib/admin/schemas";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { enquiries, registrations, type InboxStatus } from "@/lib/db/schema";
import { notifyEnquiry, notifyRegistration } from "@/lib/email/notify";

export type InboxKind = "enquiry" | "registration";

const tableFor = (kind: InboxKind) =>
  kind === "enquiry" ? enquiries : registrations;
const pathFor = (kind: InboxKind) =>
  kind === "enquiry" ? "/admin/enquiries" : "/admin/registrations";

export async function setInboxStatus(
  kind: InboxKind,
  id: number,
  status: InboxStatus,
): Promise<void> {
  await requireAdmin();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return;
  const table = tableFor(kind);
  await getDb().update(table).set({ status: parsed.data }).where(eq(table.id, id));
  revalidatePath(pathFor(kind), "layout");
}

export async function saveInboxNotes(
  kind: InboxKind,
  id: number,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = notesSchema.safeParse(formObject(formData));
  if (!parsed.success) return fail(zodErrors(parsed.error));
  const table = tableFor(kind);
  await getDb()
    .update(table)
    .set({ adminNotes: parsed.data.notes || null })
    .where(eq(table.id, id));
  return ok("Notes saved.");
}

export async function resendNotification(
  kind: InboxKind,
  id: number,
): Promise<void> {
  await requireAdmin();
  if (kind === "enquiry") await notifyEnquiry(id);
  else await notifyRegistration(id);
  revalidatePath(`${pathFor(kind)}/${id}`);
}

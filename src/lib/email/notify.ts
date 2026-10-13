import "server-only";
import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db/client";
import { enquiries, registrations, siteSettings } from "@/lib/db/schema";
import { SITE_URL } from "@/lib/site";
import { sendEmail, type SendResult } from "./resend";
import {
  enquiryNotification,
  registrationNotification,
  type Mail,
} from "./templates";

async function deliver(mail: Mail, replyTo: string): Promise<SendResult> {
  const [settings] = await getDb()
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  if (!settings) return { ok: false, error: "site_settings missing" };
  return sendEmail({
    from: `${settings.fromName} <${settings.fromEmail}>`,
    to: settings.notificationEmail,
    replyTo,
    ...mail,
  });
}

const outcome = (result: SendResult) =>
  result.ok
    ? { notifiedAt: new Date(), notifyError: null }
    : { notifyError: result.error };

/* Both helpers never throw: an email failure must not fail the save. */
export async function notifyEnquiry(id: number): Promise<void> {
  const db = getDb();
  try {
    const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id));
    if (!row) return;
    const result = await deliver(enquiryNotification(row, SITE_URL), row.email);
    await db.update(enquiries).set(outcome(result)).where(eq(enquiries.id, id));
  } catch (err) {
    console.error("[email] notifyEnquiry failed", err);
  }
}

export async function notifyRegistration(id: number): Promise<void> {
  const db = getDb();
  try {
    const [row] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id));
    if (!row) return;
    const result = await deliver(
      registrationNotification(row, SITE_URL),
      row.email,
    );
    await db
      .update(registrations)
      .set(outcome(result))
      .where(eq(registrations.id, id));
  } catch (err) {
    console.error("[email] notifyRegistration failed", err);
  }
}

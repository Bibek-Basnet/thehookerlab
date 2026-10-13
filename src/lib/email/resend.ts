import "server-only";
import { Resend } from "resend";

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; error: string };

export type OutgoingMail = {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
};

/* Never throws: callers record the outcome on the row that triggered the mail. */
export async function sendEmail(mail: OutgoingMail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[email] RESEND_API_KEY not set; would send:", {
        to: mail.to,
        subject: mail.subject,
      });
    }
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  try {
    const resend = new Resend(key);
    const { data, error } = await resend.emails.send({
      from: mail.from,
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

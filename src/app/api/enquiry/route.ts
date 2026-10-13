import { NextResponse } from "next/server";

import { zodErrors } from "@/lib/admin/form";
import { getDb } from "@/lib/db/client";
import { enquiries } from "@/lib/db/schema";
import { notifyEnquiry } from "@/lib/email/notify";
import { enquirySchema } from "@/lib/forms/enquiry-schema";
import { readJson } from "@/lib/forms/http";

const blank = (s: string) => (s ? s : null);

export async function POST(req: Request) {
  const read = await readJson(req);
  if (!read.ok) return read.response;

  /* Honeypot: bots fill the hidden "website" field. Pretend it worked. */
  const honeypot = (read.body as { website?: unknown } | null)?.website;
  if (typeof honeypot === "string" && honeypot.trim()) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = enquirySchema.safeParse(read.body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid enquiry", errors: zodErrors(parsed.error) },
      { status: 400 },
    );
  }
  const d = parsed.data;

  let id: number;
  try {
    const [row] = await getDb()
      .insert(enquiries)
      .values({
        enquiryType: d.enquiryType,
        name: d.name,
        email: d.email,
        role: d.role,
        organisation: blank(d.organisation),
        contactMethod: d.contactMethod,
        phone: blank(d.phone),
        ageGroup: blank(d.ageGroup),
        level: blank(d.level),
        groupSize: blank(d.groupSize),
        location: blank(d.location),
        timing: blank(d.timing),
        message: d.message,
        workshopTopics: d.workshopTopics,
        consentContact: d.consentContact,
        sourcePage: d.source.page,
        submittedAt: new Date(d.source.submittedAt),
      })
      .returning({ id: enquiries.id });
    id = row.id;
  } catch (err) {
    console.error("[api/enquiry] insert failed", err);
    return NextResponse.json({ error: "Could not save your enquiry" }, { status: 500 });
  }

  /* The enquiry is stored; an email failure is recorded on the row, not surfaced. */
  await notifyEnquiry(id);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

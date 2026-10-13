import { NextResponse } from "next/server";

import { zodErrors } from "@/lib/admin/form";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";
import { notifyRegistration } from "@/lib/email/notify";
import { readJson } from "@/lib/forms/http";
import { registrationSchema } from "@/lib/forms/registration-schema";

export async function POST(req: Request) {
  const read = await readJson(req);
  if (!read.ok) return read.response;

  /* Honeypot: bots fill the hidden "company" field. Pretend it worked. */
  const honeypot = (read.body as { company?: unknown } | null)?.company;
  if (typeof honeypot === "string" && honeypot.trim()) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = registrationSchema.safeParse(read.body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration", errors: zodErrors(parsed.error) },
      { status: 400 },
    );
  }
  const d = parsed.data;

  let id: number;
  try {
    const [row] = await getDb()
      .insert(registrations)
      .values({
        role: d.role,
        level: d.level,
        experience: d.experience,
        focusAreas: d.focusAreas,
        goal: d.goal || null,
        name: d.name,
        email: d.email,
        phone: d.phone || null,
        location: d.location,
        privacyAccepted: d.privacyAccepted,
        acceptedAt: new Date(d.acceptedAt),
      })
      .returning({ id: registrations.id });
    id = row.id;
  } catch (err) {
    console.error("[api/online-registrations] insert failed", err);
    return NextResponse.json(
      { error: "Could not save your registration" },
      { status: 500 },
    );
  }

  await notifyRegistration(id);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import InboxDetail from "@/components/admin/InboxDetail";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { registrations } from "@/lib/db/schema";

export const metadata = { title: "Registration" };

export default async function RegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const db = getDb();
  const [row] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.id, id));
  if (!row) notFound();

  if (row.status === "new") {
    await db
      .update(registrations)
      .set({ status: "read" })
      .where(eq(registrations.id, id));
    row.status = "read";
  }

  return (
    <>
      <PageHeader
        title={row.name}
        description={`${row.level} · ${row.acceptedAt.toLocaleString("en-NZ")}`}
      />
      <InboxDetail
        kind="registration"
        id={row.id}
        status={row.status}
        notes={row.adminNotes}
        notifiedAt={row.notifiedAt?.toLocaleString("en-NZ") ?? null}
        notifyError={row.notifyError}
        message={{ label: "Main goal", value: row.goal }}
        fields={[
          ["Email", row.email],
          ["Phone", row.phone],
          ["Location", row.location],
          ["Registering as", row.role],
          ["Level", row.level],
          ["Hooker experience", row.experience],
          ["Focus areas", row.focusAreas.join(", ") || null],
        ]}
      />
    </>
  );
}

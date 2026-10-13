import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import InboxDetail from "@/components/admin/InboxDetail";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { enquiries } from "@/lib/db/schema";

export const metadata = { title: "Enquiry" };

export default async function EnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const db = getDb();
  const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id));
  if (!row) notFound();

  /* Opening a new enquiry marks it read. */
  if (row.status === "new") {
    await db.update(enquiries).set({ status: "read" }).where(eq(enquiries.id, id));
    row.status = "read";
  }

  return (
    <>
      <PageHeader
        title={row.name}
        description={`${row.enquiryType} · ${row.submittedAt.toLocaleString("en-NZ")}`}
      />
      <InboxDetail
        kind="enquiry"
        id={row.id}
        status={row.status}
        notes={row.adminNotes}
        notifiedAt={row.notifiedAt?.toLocaleString("en-NZ") ?? null}
        notifyError={row.notifyError}
        message={{ label: "Message", value: row.message }}
        fields={[
          ["Email", row.email],
          ["Role", row.role],
          ["Organisation", row.organisation],
          ["Preferred contact", row.contactMethod],
          ["Phone", row.phone],
          ["Age group", row.ageGroup],
          ["Level", row.level],
          ["Group size", row.groupSize],
          ["Location", row.location],
          ["Timing", row.timing],
          ["Workshop topics", row.workshopTopics.join(", ") || null],
          ["Sent from", row.sourcePage],
        ]}
      />
    </>
  );
}

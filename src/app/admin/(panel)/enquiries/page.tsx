import { desc, eq } from "drizzle-orm";

import InboxList from "@/components/admin/InboxList";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { INBOX_STATUSES, enquiries } from "@/lib/db/schema";

export const metadata = { title: "Enquiries" };

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = INBOX_STATUSES.find((s) => s === status);
  const rows = await getDb()
    .select()
    .from(enquiries)
    .where(filter ? eq(enquiries.status, filter) : undefined)
    .orderBy(desc(enquiries.id))
    .limit(200);

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Messages sent through the contact form."
      />
      <InboxList
        base="/admin/enquiries"
        filter={filter}
        empty="No enquiries."
        rows={rows.map((e) => ({
          id: e.id,
          title: `${e.name} · ${e.email}`,
          subtitle: `${e.enquiryType} · ${e.submittedAt.toLocaleString("en-NZ")}`,
          status: e.status,
          notifyError: e.notifyError,
          href: `/admin/enquiries/${e.id}`,
        }))}
      />
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

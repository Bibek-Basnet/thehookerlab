import { desc, eq } from "drizzle-orm";

import InboxList from "@/components/admin/InboxList";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { INBOX_STATUSES, registrations } from "@/lib/db/schema";

export const metadata = { title: "Registrations" };

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const filter = INBOX_STATUSES.find((s) => s === status);
  const rows = await getDb()
    .select()
    .from(registrations)
    .where(filter ? eq(registrations.status, filter) : undefined)
    .orderBy(desc(registrations.id))
    .limit(200);

  return (
    <>
      <PageHeader
        title="Registrations"
        description="Sign-ups for the online programme."
      />
      <InboxList
        base="/admin/registrations"
        filter={filter}
        empty="No registrations."
        rows={rows.map((r) => ({
          id: r.id,
          title: `${r.name} · ${r.email}`,
          subtitle: `${r.level} · ${r.acceptedAt.toLocaleString("en-NZ")}`,
          status: r.status,
          notifyError: r.notifyError,
          href: `/admin/registrations/${r.id}`,
        }))}
      />
    </>
  );
}

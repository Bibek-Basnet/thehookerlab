import { asc } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import ResourceList from "@/components/admin/ResourceList";
import RowControls from "@/components/admin/RowControls";
import {
  deleteProgram,
  moveProgram,
  toggleProgram,
} from "@/lib/admin/actions/programs";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { programs } from "@/lib/db/schema";

export const metadata = { title: "Programmes" };

export default async function ProgrammesPage() {
  await requireAdmin();
  const rows = await getDb()
    .select()
    .from(programs)
    .orderBy(asc(programs.sortOrder), asc(programs.id));
  const list = rows.map((r) => ({
    id: r.id,
    title: r.title,
    subtitle: r.format,
    published: r.published,
    href: `/admin/programmes/${r.id}`,
  }));

  return (
    <>
      <PageHeader
        title="Programmes"
        description="The cards in the Programmes section of the home page."
        action={{ label: "New programme", href: "/admin/programmes/new" }}
      />
      <ResourceList
        rows={list}
        controls={(row, i) => (
          <RowControls
            id={row.id}
            label={row.title}
            published={row.published}
            isFirst={i === 0}
            isLast={i === list.length - 1}
            onMove={moveProgram}
            onToggle={toggleProgram}
            onDelete={deleteProgram}
          />
        )}
      />
    </>
  );
}

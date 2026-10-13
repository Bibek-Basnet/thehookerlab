import { asc } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import ResourceList from "@/components/admin/ResourceList";
import RowControls from "@/components/admin/RowControls";
import {
  deletePillar,
  movePillar,
  togglePillar,
} from "@/lib/admin/actions/expertise";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { expertisePillars } from "@/lib/db/schema";

export const metadata = { title: "Expertise" };

export default async function ExpertisePage() {
  await requireAdmin();
  const rows = await getDb()
    .select()
    .from(expertisePillars)
    .orderBy(asc(expertisePillars.sortOrder), asc(expertisePillars.id));
  const list = rows.map((r) => ({
    id: r.id,
    title: r.word,
    subtitle: r.summary,
    published: r.published,
    href: `/admin/expertise/${r.id}`,
  }));

  return (
    <>
      <PageHeader
        title="Expertise"
        description="The pillars and skills in the Expertise section."
        action={{ label: "New pillar", href: "/admin/expertise/new" }}
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
            onMove={movePillar}
            onToggle={togglePillar}
            onDelete={deletePillar}
          />
        )}
      />
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

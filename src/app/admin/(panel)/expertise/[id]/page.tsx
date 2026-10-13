import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { savePillar } from "@/lib/admin/actions/expertise";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { expertisePillars, expertiseSkills } from "@/lib/db/schema";
import { pillarFields } from "../fields";

export const metadata = { title: "Edit pillar" };

export default async function EditPillarPage({
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
    .from(expertisePillars)
    .where(eq(expertisePillars.id, id));
  if (!row) notFound();
  const skills = await db
    .select({ name: expertiseSkills.name, detail: expertiseSkills.detail })
    .from(expertiseSkills)
    .where(eq(expertiseSkills.pillarId, id))
    .orderBy(asc(expertiseSkills.sortOrder), asc(expertiseSkills.id));

  return (
    <>
      <PageHeader title={row.word} description={`/${row.slug}`} />
      <Panel>
        <ResourceForm
          action={savePillar.bind(null, id)}
          fields={pillarFields}
          initial={{ ...row, skills }}
          cancelHref="/admin/expertise"
        />
      </Panel>
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

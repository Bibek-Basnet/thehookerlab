import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveProgram } from "@/lib/admin/actions/programs";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { programs } from "@/lib/db/schema";
import { programFields } from "../fields";

export const metadata = { title: "Edit programme" };

export default async function EditProgrammePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await getDb().select().from(programs).where(eq(programs.id, id));
  if (!row) notFound();

  return (
    <>
      <PageHeader title={row.title} description={`/${row.slug}`} />
      <Panel>
        <ResourceForm
          action={saveProgram.bind(null, id)}
          fields={programFields}
          initial={{
            ...row,
            price: row.price ?? "",
            priceNote: row.priceNote ?? "",
          }}
          cancelHref="/admin/programmes"
        />
      </Panel>
    </>
  );
}

import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveFaq } from "@/lib/admin/actions/faqs";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { faqs } from "@/lib/db/schema";
import { faqFields } from "../fields";

export const metadata = { title: "Edit question" };

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await getDb().select().from(faqs).where(eq(faqs.id, id));
  if (!row) notFound();

  return (
    <>
      <PageHeader title="Edit question" description={row.question} />
      <Panel>
        <ResourceForm
          action={saveFaq.bind(null, id)}
          fields={faqFields}
          initial={{ ...row }}
          cancelHref="/admin/faq"
        />
      </Panel>
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

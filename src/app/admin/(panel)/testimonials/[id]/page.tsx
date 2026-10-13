import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveTestimonial } from "@/lib/admin/actions/testimonials";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { testimonials } from "@/lib/db/schema";
import { testimonialFields } from "../fields";

export const metadata = { title: "Edit testimonial" };

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await getDb()
    .select()
    .from(testimonials)
    .where(eq(testimonials.id, id));
  if (!row) notFound();

  return (
    <>
      <PageHeader title={row.name} description={`${row.role}, ${row.org}`} />
      <Panel>
        <ResourceForm
          action={saveTestimonial.bind(null, id)}
          fields={testimonialFields}
          initial={{ ...row }}
          cancelHref="/admin/testimonials"
        />
      </Panel>
    </>
  );
}

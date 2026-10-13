import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveTestimonial } from "@/lib/admin/actions/testimonials";
import { requireAdmin } from "@/lib/auth/dal";
import { testimonialFields } from "../fields";

export const metadata = { title: "New testimonial" };

export default async function NewTestimonialPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New testimonial" />
      <Panel>
        <ResourceForm
          action={saveTestimonial.bind(null, null)}
          fields={testimonialFields}
          initial={{ published: true }}
          submitLabel="Create testimonial"
          cancelHref="/admin/testimonials"
        />
      </Panel>
    </>
  );
}

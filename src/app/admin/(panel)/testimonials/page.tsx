import { asc } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import ResourceList from "@/components/admin/ResourceList";
import RowControls from "@/components/admin/RowControls";
import {
  deleteTestimonial,
  moveTestimonial,
  toggleTestimonial,
} from "@/lib/admin/actions/testimonials";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { testimonials } from "@/lib/db/schema";

export const metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
  await requireAdmin();
  const rows = await getDb()
    .select()
    .from(testimonials)
    .orderBy(asc(testimonials.sortOrder), asc(testimonials.id));
  const list = rows.map((r) => ({
    id: r.id,
    title: r.name,
    subtitle: `${r.role}, ${r.org}`,
    published: r.published,
    href: `/admin/testimonials/${r.id}`,
  }));

  return (
    <>
      <PageHeader
        title="Testimonials"
        description="Quotes shown in the Testimonials section."
        action={{ label: "New testimonial", href: "/admin/testimonials/new" }}
      />
      <ResourceList
        rows={list}
        controls={(row, i) => (
          <RowControls
            id={row.id}
            label={row.title}
            editHref={row.href}
            published={row.published}
            isFirst={i === 0}
            isLast={i === list.length - 1}
            onMove={moveTestimonial}
            onToggle={toggleTestimonial}
            onDelete={deleteTestimonial}
          />
        )}
      />
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

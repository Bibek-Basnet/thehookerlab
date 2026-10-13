import { asc } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import ResourceList from "@/components/admin/ResourceList";
import RowControls from "@/components/admin/RowControls";
import { deleteFaq, moveFaq, toggleFaq } from "@/lib/admin/actions/faqs";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { faqs } from "@/lib/db/schema";

export const metadata = { title: "FAQ" };

export default async function FaqAdminPage() {
  await requireAdmin();
  const rows = await getDb()
    .select()
    .from(faqs)
    .orderBy(asc(faqs.sortOrder), asc(faqs.id));
  const list = rows.map((r) => ({
    id: r.id,
    title: r.question,
    published: r.published,
    href: `/admin/faq/${r.id}`,
  }));

  return (
    <>
      <PageHeader
        title="FAQ"
        description="Questions and answers on the FAQ page."
        action={{ label: "New question", href: "/admin/faq/new" }}
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
            onMove={moveFaq}
            onToggle={toggleFaq}
            onDelete={deleteFaq}
          />
        )}
      />
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

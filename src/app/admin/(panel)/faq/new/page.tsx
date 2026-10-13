import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveFaq } from "@/lib/admin/actions/faqs";
import { requireAdmin } from "@/lib/auth/dal";
import { faqFields } from "../fields";

export const metadata = { title: "New question" };

export default async function NewFaqPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New question" />
      <Panel>
        <ResourceForm
          action={saveFaq.bind(null, null)}
          fields={faqFields}
          initial={{ published: true }}
          submitLabel="Create question"
          cancelHref="/admin/faq"
        />
      </Panel>
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

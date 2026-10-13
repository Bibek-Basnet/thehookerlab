import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { savePillar } from "@/lib/admin/actions/expertise";
import { requireAdmin } from "@/lib/auth/dal";
import { pillarFields } from "../fields";

export const metadata = { title: "New pillar" };

export default async function NewPillarPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New pillar" />
      <Panel>
        <ResourceForm
          action={savePillar.bind(null, null)}
          fields={pillarFields}
          initial={{ panel: true, published: true, skills: [] }}
          submitLabel="Create pillar"
          cancelHref="/admin/expertise"
        />
      </Panel>
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

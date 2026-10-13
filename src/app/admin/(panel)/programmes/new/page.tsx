import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveProgram } from "@/lib/admin/actions/programs";
import { requireAdmin } from "@/lib/auth/dal";
import { programFields } from "../fields";

export const metadata = { title: "New programme" };

export default async function NewProgrammePage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="New programme" />
      <Panel>
        <ResourceForm
          action={saveProgram.bind(null, null)}
          fields={programFields}
          initial={{
            listTitle: "At a glance",
            published: true,
            showPrice: false,
            points: [],
          }}
          submitLabel="Create programme"
          cancelHref="/admin/programmes"
        />
      </Panel>
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

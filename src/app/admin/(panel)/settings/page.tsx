import { eq } from "drizzle-orm";

import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveSettings } from "@/lib/admin/actions/settings";
import type { FieldDef } from "@/lib/admin/fields";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { siteSettings } from "@/lib/db/schema";

export const metadata = { title: "Settings" };

const fields: FieldDef[] = [
  {
    kind: "toggle",
    name: "showPricing",
    label: "Show programme prices on the site",
    hint: "Each programme also has its own switch. Both must be on.",
  },
  {
    kind: "text",
    name: "currency",
    label: "Currency code",
    placeholder: "NZD",
  },
  {
    kind: "email",
    name: "contactEmail",
    label: "Public contact email",
    hint: "Shown in the navbar, footer and contact section.",
  },
  {
    kind: "email",
    name: "notificationEmail",
    label: "Notification email",
    hint: "Where new enquiries and registrations are sent.",
  },
  { kind: "text", name: "fromName", label: "Sender name" },
  {
    kind: "email",
    name: "fromEmail",
    label: "Sender email",
    hint: "Must be on a domain verified in Resend.",
  },
];

export default async function SettingsPage() {
  await requireAdmin();
  const [row] = await getDb()
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));

  return (
    <>
      <PageHeader
        title="Settings"
        description="Pricing, contact and email configuration."
      />
      <Panel>
        <ResourceForm action={saveSettings} fields={fields} initial={{ ...row }} />
      </Panel>
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

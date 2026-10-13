import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { changePassword, saveAccount } from "@/lib/admin/actions/account";
import type { FieldDef } from "@/lib/admin/fields";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata = { title: "Account" };

const profile: FieldDef[] = [
  { kind: "text", name: "name", label: "Name" },
  {
    kind: "email",
    name: "email",
    label: "Email",
    hint: "You sign in with this.",
  },
];

const password: FieldDef[] = [
  { kind: "password", name: "currentPassword", label: "Current password" },
  {
    kind: "password",
    name: "newPassword",
    label: "New password",
    hint: "At least 10 characters.",
  },
  { kind: "password", name: "confirmPassword", label: "Confirm new password" },
];

export default async function AccountPage() {
  const user = await requireAdmin();
  return (
    <>
      <PageHeader title="Account" description="Your admin sign-in details." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="mb-6 font-display text-2xl">Profile</h2>
          <ResourceForm
            action={saveAccount}
            fields={profile}
            initial={{ name: user.name, email: user.email }}
          />
        </Panel>
        <Panel>
          <h2 className="mb-6 font-display text-2xl">Password</h2>
          <ResourceForm
            action={changePassword}
            fields={password}
            initial={{}}
            submitLabel="Change password"
          />
        </Panel>
      </div>
    </>
  );
}

/* Admin pages read the session at request time; opt out of the instant-navigation check. */
export const instant = false;

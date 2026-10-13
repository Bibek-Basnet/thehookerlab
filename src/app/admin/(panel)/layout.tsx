import type { Metadata } from "next";
import { Suspense } from "react";

import Shell from "@/components/admin/Shell";
import Toast from "@/components/admin/Toast";
import { requireAdmin } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

/* Every admin page reads the session and the database at request time, so
   navigations into the panel block on the server by design. */
export const instant = false;

/* The session read happens at request time, so it sits inside Suspense
   rather than at the top of the layout. */
async function Panel({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return <Shell user={user}>{children}</Shell>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <Panel>{children}</Panel>
      <Suspense fallback={null}>
        <Toast />
      </Suspense>
    </Suspense>
  );
}

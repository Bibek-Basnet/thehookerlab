import { count, desc, eq } from "drizzle-orm";
import Link from "next/link";

import PageHeader from "@/components/admin/PageHeader";
import StatusBadge from "@/components/admin/StatusBadge";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { enquiries, registrations } from "@/lib/db/schema";

const card = "block rounded-[1.25rem] border border-line bg-coal p-6";

export default async function Dashboard() {
  /* Pages render in parallel with the layout, so each page guards itself. */
  await requireAdmin();
  const db = getDb();
  const [[newEnq], [newReg], latestEnq, latestReg] = await Promise.all([
    db.select({ n: count() }).from(enquiries).where(eq(enquiries.status, "new")),
    db
      .select({ n: count() })
      .from(registrations)
      .where(eq(registrations.status, "new")),
    db.select().from(enquiries).orderBy(desc(enquiries.id)).limit(5),
    db.select().from(registrations).orderBy(desc(registrations.id)).limit(5),
  ]);

  return (
    <>
      <PageHeader title="Dashboard" description="What needs your attention." />
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/admin/enquiries?status=new" className={card}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">
            New enquiries
          </p>
          <p className="mt-2 font-display text-5xl">{Number(newEnq.n)}</p>
        </Link>
        <Link href="/admin/registrations?status=new" className={card}>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">
            New registrations
          </p>
          <p className="mt-2 font-display text-5xl">{Number(newReg.n)}</p>
        </Link>

        <div className={card}>
          <h2 className="font-display text-2xl">Latest enquiries</h2>
          <ul className="mt-4 divide-y divide-line">
            {latestEnq.length === 0 && (
              <li className="py-3 text-sm text-mist">Nothing yet.</li>
            )}
            {latestEnq.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <Link
                  href={`/admin/enquiries/${e.id}`}
                  className="truncate hover:underline"
                >
                  {e.name} · {e.enquiryType}
                </Link>
                <StatusBadge status={e.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className={card}>
          <h2 className="font-display text-2xl">Latest registrations</h2>
          <ul className="mt-4 divide-y divide-line">
            {latestReg.length === 0 && (
              <li className="py-3 text-sm text-mist">Nothing yet.</li>
            )}
            {latestReg.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <Link
                  href={`/admin/registrations/${r.id}`}
                  className="truncate hover:underline"
                >
                  {r.name} · {r.level}
                </Link>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

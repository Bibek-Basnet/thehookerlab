import Link from "next/link";

import { INBOX_STATUSES } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

export type InboxRow = {
  id: number;
  title: string;
  subtitle: string;
  status: string;
  notifyError: string | null;
  href: string;
};

export default function InboxList({
  base,
  filter,
  rows,
  empty,
}: {
  base: string;
  filter?: string;
  rows: InboxRow[];
  empty: string;
}) {
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        {[undefined, ...INBOX_STATUSES].map((s) => (
          <Link
            key={s ?? "all"}
            href={s ? `${base}?status=${s}` : base}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]",
              s === filter
                ? "border-bone bg-bone text-ink"
                : "border-line text-mist hover:text-bone",
            )}
          >
            {s ?? "all"}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <p className="rounded-[1.25rem] border border-dashed border-line p-8 text-center text-sm text-mist">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-line rounded-[1.25rem] border border-line bg-coal">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={r.href}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-steel/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.title}</p>
                  <p className="truncate text-xs text-mist">{r.subtitle}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.notifyError && (
                    <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-accent">
                      email failed
                    </span>
                  )}
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

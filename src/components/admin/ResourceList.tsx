import Link from "next/link";

import StatusBadge from "./StatusBadge";

export type ListRow = {
  id: number;
  title: string;
  subtitle?: string;
  published?: boolean;
  href: string;
};

export default function ResourceList({
  rows,
  controls,
}: {
  rows: ListRow[];
  controls: (row: ListRow, index: number) => React.ReactNode;
}) {
  if (rows.length === 0) {
    return (
      <p className="rounded-[1.25rem] border border-dashed border-line p-8 text-center text-sm text-mist">
        Nothing here yet.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-line rounded-[1.25rem] border border-line bg-coal">
      {rows.map((row, i) => (
        <li
          key={row.id}
          className="flex items-center justify-between gap-4 px-5 py-4"
        >
          <div className="min-w-0">
            <Link
              href={row.href}
              className="block truncate font-medium hover:underline"
            >
              {row.title}
            </Link>
            {row.subtitle && (
              <p className="truncate text-xs text-mist">{row.subtitle}</p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {row.published !== undefined && (
              <StatusBadge status={row.published ? "published" : "hidden"} />
            )}
            {controls(row, i)}
          </div>
        </li>
      ))}
    </ul>
  );
}

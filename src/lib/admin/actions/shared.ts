import "server-only";
import { asc, sql, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";

import { reorderIds, type Direction } from "@/lib/admin/reorder";
import { getDb, type Db } from "@/lib/db/client";

export type SortableTable = PgTable & { id: PgColumn; sortOrder: PgColumn };

/* Move one row up or down, then renumber the whole list 0..n-1 so the order
   stays dense even if sort_order values were duplicated. */
export async function moveRow(
  table: SortableTable,
  id: number,
  direction: Direction,
  where?: SQL,
): Promise<void> {
  const db = getDb();
  const rows = (await db
    .select({ id: table.id })
    .from(table)
    .where(where)
    .orderBy(asc(table.sortOrder), asc(table.id))) as { id: number }[];
  const ordered = reorderIds(
    rows.map((r) => r.id),
    id,
    direction,
  );
  await applyOrder(db, table, ordered);
}

export async function applyOrder(
  db: Db,
  table: SortableTable,
  orderedIds: number[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (const [i, rowId] of orderedIds.entries()) {
      await tx.execute(
        sql`update ${table} set sort_order = ${i} where id = ${rowId}`,
      );
    }
  });
}

/* New rows go to the end of the list. */
export async function nextSortOrder(
  table: SortableTable,
  where?: SQL,
): Promise<number> {
  const [row] = await getDb()
    .select({ max: sql<number>`coalesce(max(sort_order), -1)` })
    .from(table)
    .where(where);
  return Number(row.max) + 1;
}

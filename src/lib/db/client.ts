import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

type Db = ReturnType<typeof build>;

const g = globalThis as unknown as { __thlPool?: Pool; __thlDb?: Db };

/* Vercel's Neon integration names the variable MYDB_DATABASE_URL; local
   development uses DATABASE_URL. Either works. */
export const databaseUrl = () =>
  process.env.MYDB_DATABASE_URL || process.env.DATABASE_URL;

function build() {
  const url = databaseUrl();
  if (!url) throw new Error("MYDB_DATABASE_URL or DATABASE_URL must be set");
  g.__thlPool ??= new Pool({ connectionString: url, max: 5 });
  return drizzle(g.__thlPool, { schema });
}

export function getDb(): Db {
  g.__thlDb ??= build();
  return g.__thlDb;
}

export type { Db };

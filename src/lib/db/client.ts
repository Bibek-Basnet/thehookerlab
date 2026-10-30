import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

type Db = ReturnType<typeof build>;

const g = globalThis as unknown as { __thlPool?: Pool; __thlDb?: Db; __thlDbUrl?: string };

/* Vercel's Neon integration names the variable MYDB_DATABASE_URL; local
   development uses DATABASE_URL. Either works. */
export const databaseUrl = () =>
  process.env.MYDB_DATABASE_URL || process.env.DATABASE_URL;

/* A pasted "DATABASE_URL=postgresql://…" as the value otherwise surfaces as a
   DNS failure for a made-up host deep inside the first query. */
function checkUrl(url: string) {
  let ok = false;
  try {
    ok = /^postgres(ql)?:$/.test(new URL(url).protocol);
  } catch {
    /* falls through */
  }
  if (!ok) {
    throw new Error(
      "DATABASE_URL is not a postgresql:// connection string. Check .env: the value should start with postgresql:// (not repeat the variable name or include quotes or a psql command).",
    );
  }
}

function build(url: string) {
  checkUrl(url);
  /* Kept on globalThis so dev reloads reuse it; a changed URL (e.g. .env edited
     while next dev runs) gets a fresh pool instead of the old one. */
  if (g.__thlPool && g.__thlDbUrl !== url) void g.__thlPool.end().catch(() => {});
  if (!g.__thlPool || g.__thlDbUrl !== url) {
    g.__thlPool = new Pool({ connectionString: url, max: 5 });
    g.__thlDbUrl = url;
  }
  return drizzle(g.__thlPool, { schema });
}

export function getDb(): Db {
  const url = databaseUrl();
  if (!url) throw new Error("MYDB_DATABASE_URL or DATABASE_URL must be set");
  if (!g.__thlDb || g.__thlDbUrl !== url) g.__thlDb = build(url);
  return g.__thlDb;
}

export type { Db };

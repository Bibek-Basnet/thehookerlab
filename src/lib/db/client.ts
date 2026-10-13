import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

type Db = ReturnType<typeof build>;

const g = globalThis as unknown as { __thlPool?: Pool; __thlDb?: Db };

function build() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  g.__thlPool ??= new Pool({ connectionString: url, max: 5 });
  return drizzle(g.__thlPool, { schema });
}

export function getDb(): Db {
  g.__thlDb ??= build();
  return g.__thlDb;
}

export type { Db };

/* Field definitions are plain data so a server page can hand them to the
   client-side ResourceForm. */
export type FieldDef = { name: string; label: string; hint?: string } & (
  | {
      kind: "text" | "email" | "slug" | "image" | "password";
      placeholder?: string;
    }
  | { kind: "textarea"; rows?: number; placeholder?: string }
  | { kind: "toggle" }
  | { kind: "select"; options: { value: string; label: string }[] }
  | { kind: "list"; max?: number }
  | { kind: "pairs"; labels: [string, string]; max?: number }
);

/* Loose on purpose: pages spread whole DB rows (dates, numbers) into it;
   ResourceForm only reads strings, booleans and arrays. */
export type FormValues = Record<string, unknown>;

export type Pair = { name: string; detail: string };

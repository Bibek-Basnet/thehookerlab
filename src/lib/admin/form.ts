import { z, type ZodError } from "zod";

export type ActionState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; errors: Record<string, string>; message?: string };

export const initialState: ActionState = { status: "idle" };

export const ok = (message?: string): ActionState => ({
  status: "success",
  message,
});

export const fail = (
  errors: Record<string, string>,
  message?: string,
): ActionState => ({ status: "error", errors, message });

/* First message per field, keyed by dotted path. */
export function zodErrors(error: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}

/* The field's own error, or the first error inside it (e.g. "points.1"). */
export function fieldError(
  errors: Record<string, string>,
  name: string,
): string | undefined {
  if (errors[name]) return errors[name];
  const nested = Object.keys(errors).find((k) => k.startsWith(`${name}.`));
  return nested ? errors[nested] : undefined;
}

/* Checkboxes arrive as "on" when ticked and are absent otherwise. */
export const checkbox = z.preprocess(
  (v) => v === "on" || v === "true",
  z.boolean(),
);

/* List editors submit their rows as a JSON array in one hidden field. */
export const jsonList = z.string().transform((raw, ctx) => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("not an array");
    return parsed.map((v) => String(v).trim()).filter(Boolean);
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid list" });
    return z.NEVER;
  }
});

/* FormData -> plain object. Repeated keys keep the first value; files are ignored. */
export function formObject(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (typeof v === "string" && !(k in out)) out[k] = v;
  }
  return out;
}

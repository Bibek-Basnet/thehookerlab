"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { FieldDef, FormValues, Pair } from "@/lib/admin/fields";
import { fieldError, initialState, type ActionState } from "@/lib/admin/form";
import { Field, Toggle, inputClass } from "./fields";
import ListEditor from "./ListEditor";
import PairListEditor from "./PairListEditor";
import SubmitButton from "./SubmitButton";

type Props = {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  fields: FieldDef[];
  initial: FormValues;
  submitLabel?: string;
  cancelHref?: string;
  hidden?: Record<string, string>;
};

/* Config-driven form: a server page passes field definitions, initial values
   and a server action; this renders inputs and shows the action's errors. */
export default function ResourceForm({
  action,
  fields,
  initial,
  submitLabel = "Save",
  cancelHref,
  hidden,
}: Props) {
  const [state, formAction] = useActionState(action, initialState);
  const errors = state.status === "error" ? state.errors : {};
  const str = (name: string) => {
    const v = initial[name];
    return typeof v === "string" ? v : "";
  };
  const list = (name: string) =>
    Array.isArray(initial[name]) ? (initial[name] as string[]) : [];
  const pairList = (name: string) =>
    Array.isArray(initial[name]) ? (initial[name] as Pair[]) : [];

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      )}
      {state.status === "success" && state.message && (
        <p
          role="status"
          className="rounded-xl border border-line bg-steel px-4 py-3 text-sm"
        >
          {state.message}
        </p>
      )}
      {hidden &&
        Object.entries(hidden).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

      {fields.map((f) => {
        const error = fieldError(errors, f.name);
        switch (f.kind) {
          case "toggle":
            return (
              <Toggle
                key={f.name}
                name={f.name}
                label={f.label}
                hint={f.hint}
                defaultChecked={initial[f.name] === true}
              />
            );
          case "textarea":
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <textarea
                  name={f.name}
                  rows={f.rows ?? 4}
                  defaultValue={str(f.name)}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
              </Field>
            );
          case "select":
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <select
                  name={f.name}
                  defaultValue={str(f.name)}
                  className={inputClass}
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            );
          case "list":
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <ListEditor name={f.name} initial={list(f.name)} max={f.max} />
              </Field>
            );
          case "pairs":
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <PairListEditor
                  name={f.name}
                  labels={f.labels}
                  max={f.max}
                  initial={pairList(f.name)}
                />
              </Field>
            );
          case "image": {
            const src = str(f.name);
            return (
              <Field
                key={f.name}
                label={f.label}
                hint={f.hint ?? "A URL or a path under /images"}
                error={error}
              >
                <div className="flex gap-3">
                  {src && (
                    // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary URL
                    <img
                      src={src}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                  )}
                  <input
                    name={f.name}
                    defaultValue={src}
                    placeholder={f.placeholder}
                    className={inputClass}
                  />
                </div>
              </Field>
            );
          }
          default:
            return (
              <Field key={f.name} label={f.label} hint={f.hint} error={error}>
                <input
                  name={f.name}
                  type={
                    f.kind === "password"
                      ? "password"
                      : f.kind === "email"
                        ? "email"
                        : "text"
                  }
                  defaultValue={f.kind === "password" ? undefined : str(f.name)}
                  placeholder={f.placeholder}
                  autoComplete={f.kind === "password" ? "new-password" : undefined}
                  className={inputClass}
                />
              </Field>
            );
        }
      })}

      <div className="flex items-center gap-4 pt-2">
        <SubmitButton>{submitLabel}</SubmitButton>
        {cancelHref && (
          <Link
            href={cancelHref}
            className="text-xs uppercase tracking-[0.2em] text-mist hover:text-bone"
          >
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}

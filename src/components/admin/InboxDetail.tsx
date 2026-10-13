"use client";

import { useRouter } from "next/navigation";
import { useActionState, useTransition } from "react";

import {
  resendNotification,
  saveInboxNotes,
  setInboxStatus,
  type InboxKind,
} from "@/lib/admin/actions/inbox";
import { initialState } from "@/lib/admin/form";
import { INBOX_STATUSES, type InboxStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { Field, Panel, inputClass } from "./fields";
import StatusBadge from "./StatusBadge";
import SubmitButton from "./SubmitButton";

type Props = {
  kind: InboxKind;
  id: number;
  status: string;
  notes: string | null;
  notifiedAt: string | null;
  notifyError: string | null;
  fields: [label: string, value: string | null][];
  message: { label: string; value: string | null };
};

export default function InboxDetail({
  kind,
  id,
  status,
  notes,
  notifiedAt,
  notifyError,
  fields,
  message,
}: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, notesAction] = useActionState(
    saveInboxNotes.bind(null, kind, id),
    initialState,
  );

  const act = (fn: () => Promise<void>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <Panel>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {fields
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] uppercase tracking-[0.28em] text-mist">
                  {k}
                </dt>
                <dd className="mt-1 text-sm break-words">{v}</dd>
              </div>
            ))}
        </dl>
        {message.value && (
          <div className="mt-6 border-t border-line pt-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-mist">
              {message.label}
            </p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {message.value}
            </p>
          </div>
        )}
      </Panel>

      <div className="space-y-6">
        <Panel>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">
            Status
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INBOX_STATUSES.map((s: InboxStatus) => (
              <button
                key={s}
                type="button"
                disabled={pending || s === status}
                onClick={() => act(() => setInboxStatus(kind, id, s))}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] disabled:cursor-default",
                  s === status
                    ? "border-bone bg-bone text-ink"
                    : "border-line text-mist hover:text-bone",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </Panel>

        <Panel>
          <p className="text-[11px] uppercase tracking-[0.28em] text-mist">
            Notification email
          </p>
          <div className="mt-3 flex items-center gap-3">
            <StatusBadge status={notifiedAt ? "sent" : "failed"} />
            <span className="text-sm">
              {notifiedAt ? `Sent ${notifiedAt}` : "Not sent"}
            </span>
          </div>
          {notifyError && (
            <p className="mt-2 text-xs text-accent break-words">{notifyError}</p>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => act(() => resendNotification(kind, id))}
            className="mt-4 rounded-full border border-line px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-mist hover:text-bone disabled:opacity-60"
          >
            {pending ? "Sending" : notifiedAt ? "Send again" : "Resend now"}
          </button>
        </Panel>

        <Panel>
          <form action={notesAction} className="space-y-4">
            <Field
              label="Private notes"
              error={state.status === "error" ? state.errors.notes : undefined}
            >
              <textarea
                name="notes"
                rows={5}
                defaultValue={notes ?? ""}
                className={inputClass}
              />
            </Field>
            {state.status === "success" && (
              <p role="status" className="text-xs text-mist">
                {state.message}
              </p>
            )}
            <SubmitButton>Save notes</SubmitButton>
          </form>
        </Panel>
      </div>
    </div>
  );
}

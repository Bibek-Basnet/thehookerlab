"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingLabel = "Saving",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-accent px-6 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-accent-deep disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

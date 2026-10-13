"use client";

export default function ConfirmDialog({
  open,
  title,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-5"
    >
      <div className="w-full max-w-sm rounded-[1.25rem] border border-line bg-coal p-6">
        <p className="text-sm">{title}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.2em]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-accent px-4 py-2 text-xs uppercase tracking-[0.2em] text-bone"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

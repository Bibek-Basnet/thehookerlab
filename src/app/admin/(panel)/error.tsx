"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="rounded-[1.25rem] border border-accent/40 bg-accent/10 p-6">
      <h2 className="font-display text-2xl">Something went wrong</h2>
      <p className="mt-2 text-sm text-mist">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-full border border-bone px-5 py-2 text-xs uppercase tracking-[0.2em]"
      >
        Try again
      </button>
    </div>
  );
}

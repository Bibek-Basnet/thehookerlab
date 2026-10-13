import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-xl border border-line bg-steel px-4 py-3 text-bone placeholder:text-mist/60 focus:border-bone focus:outline-none disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <span className="block text-[11px] uppercase tracking-[0.28em] text-mist">
        {label}
      </span>
      {children}
      {hint && !error && <p className="text-xs text-mist">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

export function Toggle({
  name,
  label,
  defaultChecked,
  hint,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
      />
      <span>
        <span className="block text-sm text-bone">{label}</span>
        {hint && <span className="block text-xs text-mist">{hint}</span>}
      </span>
    </label>
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-line bg-coal p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

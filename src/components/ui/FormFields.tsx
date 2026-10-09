"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretDown, Check } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Shared look for text inputs, selects and textareas */
export const controlClass = (invalid?: boolean) =>
  cn(
    "w-full rounded-xl border bg-white px-4 py-3.5 text-[17px] font-medium text-ink transition-colors duration-300 placeholder:text-ink/40 hover:border-ink/50 focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent",
    invalid ? "border-accent" : "border-ink/20"
  );

export const describedBy = (id: string, hint?: string, error?: string) =>
  [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ") || undefined;

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={`${id}-error`} className="mt-2 text-[15px] font-semibold text-accent">
      {message}
    </p>
  );
}

type FieldProps = {
  id: string;
  label: string;
  optional?: boolean;
  hint?: string;
  error?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function Field({
  id,
  label,
  optional,
  hint,
  error,
  aside,
  className,
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-base font-semibold">
          {label}
        </label>
        {aside ??
          (optional ? (
            <span className="text-sm font-medium text-ink/55">Optional</span>
          ) : null)}
      </div>

      {hint && (
        <p
          id={`${id}-hint`}
          className="mt-1 text-[15px] font-medium leading-snug text-ink/65"
        >
          {hint}
        </p>
      )}

      <div className="mt-2.5">{children}</div>
      <FieldError id={id} message={error} />
    </div>
  );
}

type Option = { id: string; label: string };

type SelectControlProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  invalid?: boolean;
  describedById?: string;
  autoComplete?: string;
};

export function SelectControl({
  id,
  value,
  onChange,
  options,
  placeholder,
  invalid,
  describedById,
  autoComplete,
}: SelectControlProps) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={describedById}
        autoComplete={autoComplete}
        className={cn(
          controlClass(invalid),
          "appearance-none pr-11",
          !value && "text-ink/45"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id} className="text-ink">
            {o.label}
          </option>
        ))}
      </select>
      <CaretDown
        aria-hidden="true"
        size={18}
        weight="bold"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink"
      />
    </div>
  );
}

type ChipsProps = {
  options: Option[];
  role: "radio" | "checkbox";
  isActive: (id: string) => boolean;
  onSelect: (id: string) => void;
  className?: string;
};

export function Chips({
  options,
  role,
  isActive,
  onSelect,
  className,
}: ChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {options.map((o) => {
        const on = isActive(o.id);

        return (
          <motion.button
            key={o.id}
            type="button"
            role={role}
            aria-checked={on}
            onClick={() => onSelect(o.id)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "rounded-full border px-4 py-2.5 text-base font-semibold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              on
                ? "border-ink bg-ink text-bone"
                : "border-ink/20 bg-white text-ink hover:border-ink hover:text-accent"
            )}
          >
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}

type CheckFieldProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: string;
};

export function CheckField({
  id,
  checked,
  onChange,
  label,
  error,
}: CheckFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "peer size-6 cursor-pointer appearance-none rounded-md border bg-white transition-colors duration-300 checked:border-accent checked:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              error ? "border-accent" : "border-ink/30"
            )}
          />
          <Check
            aria-hidden="true"
            size={14}
            weight="bold"
            className="pointer-events-none absolute text-bone opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
          />
        </span>
        <span className="text-[17px] font-medium leading-snug">{label}</span>
      </label>
      <FieldError id={id} message={error} />
    </div>
  );
}

/* Smoothly opens and closes conditional fields */
export function Reveal({
  show,
  className,
  children,
}: {
  show: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={cn("overflow-hidden", className)}
        >
          <div className="-m-1 p-1">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
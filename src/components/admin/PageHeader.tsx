import Link from "next/link";

export default function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm text-mist">{description}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="rounded-full bg-accent px-5 py-2.5 text-[12px] font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-accent-deep"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  new: "border-accent/40 bg-accent/15 text-accent",
  read: "border-line bg-steel text-bone",
  archived: "border-line bg-coal text-mist",
  published: "border-line bg-steel text-bone",
  hidden: "border-line bg-coal text-mist",
  sent: "border-line bg-steel text-bone",
  failed: "border-accent/40 bg-accent/15 text-accent",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em]",
        styles[status] ?? styles.read,
      )}
    >
      {status}
    </span>
  );
}

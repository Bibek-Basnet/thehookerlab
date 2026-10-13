export type Direction = "up" | "down";

/* Returns a new ordering with `id` swapped one place; unchanged at the edges
   or when the id is unknown. */
export function reorderIds(
  ids: number[],
  id: number,
  direction: Direction,
): number[] {
  const index = ids.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= ids.length) return [...ids];
  const next = [...ids];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

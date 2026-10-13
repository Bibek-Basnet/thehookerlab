import { describe, expect, it } from "vitest";
import { reorderIds } from "@/lib/admin/reorder";

describe("reorderIds", () => {
  it("moves an id up one place", () => {
    expect(reorderIds([1, 2, 3], 3, "up")).toEqual([1, 3, 2]);
  });

  it("moves an id down one place", () => {
    expect(reorderIds([1, 2, 3], 1, "down")).toEqual([2, 1, 3]);
  });

  it("is a no-op at the edges", () => {
    expect(reorderIds([1, 2, 3], 1, "up")).toEqual([1, 2, 3]);
    expect(reorderIds([1, 2, 3], 3, "down")).toEqual([1, 2, 3]);
  });

  it("is a no-op for a single item or an unknown id", () => {
    expect(reorderIds([7], 7, "up")).toEqual([7]);
    expect(reorderIds([1, 2], 9, "down")).toEqual([1, 2]);
  });
});

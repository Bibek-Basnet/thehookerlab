import { describe, expect, it } from "vitest";
import { z } from "zod";
import { checkbox, fieldError, formObject, jsonList, zodErrors } from "@/lib/admin/form";

describe("zodErrors", () => {
  it("keeps the first message per field, keyed by path", () => {
    const schema = z.object({
      title: z.string().min(2, "Too short"),
      nested: z.object({ a: z.string() }),
    });
    const result = schema.safeParse({ title: "", nested: {} });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = zodErrors(result.error);
      expect(errors.title).toBe("Too short");
      expect(errors["nested.a"]).toBeTypeOf("string");
    }
  });
});

describe("checkbox", () => {
  it("treats 'on' and 'true' as true and anything else as false", () => {
    expect(checkbox.parse("on")).toBe(true);
    expect(checkbox.parse("true")).toBe(true);
    expect(checkbox.parse(undefined)).toBe(false);
    expect(checkbox.parse("")).toBe(false);
  });
});

describe("jsonList", () => {
  it("parses a JSON array of trimmed non-empty strings", () => {
    expect(jsonList.parse('["a ", " b"]')).toEqual(["a", "b"]);
  });

  it("drops empty entries", () => {
    expect(jsonList.parse('["a", "  ", ""]')).toEqual(["a"]);
  });

  it("rejects invalid JSON", () => {
    expect(jsonList.safeParse("nope").success).toBe(false);
  });
});

describe("fieldError", () => {
  it("returns the field's own error or the first nested one", () => {
    const errors = { "points.1": "Keep it under 120 characters", title: "Title is required" };
    expect(fieldError(errors, "title")).toBe("Title is required");
    expect(fieldError(errors, "points")).toBe("Keep it under 120 characters");
    expect(fieldError(errors, "summary")).toBeUndefined();
  });
});

describe("formObject", () => {
  it("keeps the first string value per key and ignores files", () => {
    const fd = new FormData();
    fd.append("a", "1");
    fd.append("a", "2");
    fd.append("f", new Blob(["x"]), "x.txt");
    expect(formObject(fd)).toEqual({ a: "1" });
  });
});

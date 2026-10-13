import { afterEach, describe, expect, it, vi } from "vitest";
import { withFallback } from "@/lib/content/fallback";

describe("withFallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("returns the read value when it succeeds", async () => {
    await expect(withFallback("x", async () => 1, () => 2)).resolves.toBe(1);
  });

  it("rethrows outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(
      withFallback(
        "x",
        async () => {
          throw new Error("db");
        },
        () => 2,
      ),
    ).rejects.toThrow("db");
  });

  it("logs and returns the fallback in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const onFallback = vi.fn();
    await expect(
      withFallback(
        "x",
        async () => {
          throw new Error("db");
        },
        () => 2,
        onFallback,
      ),
    ).resolves.toBe(2);
    expect(err).toHaveBeenCalledOnce();
    expect(onFallback).toHaveBeenCalledOnce();
  });
});

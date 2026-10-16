import { afterEach, describe, expect, it, vi } from "vitest";
import { storageTarget, uploadFailureMessage } from "@/lib/admin/storage-rules";

describe("storageTarget", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses Vercel Blob when the token is present", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_x");
    expect(storageTarget()).toBe("blob");
  });

  it("falls back to the local public folder otherwise", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    expect(storageTarget()).toBe("disk");
  });
});

describe("uploadFailureMessage", () => {
  it("explains a read-only disk in terms of what to do", () => {
    const err = Object.assign(new Error("EROFS: read-only file system"), { code: "EROFS" });
    expect(uploadFailureMessage(err)).toMatch(/Vercel Blob/);
  });

  it("is generic for anything else", () => {
    expect(uploadFailureMessage(new Error("boom"))).toBe("Could not save the image");
  });
});

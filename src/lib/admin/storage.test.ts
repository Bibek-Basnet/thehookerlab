import { afterEach, describe, expect, it, vi } from "vitest";
import { storageTarget, uploadFailureMessage } from "@/lib/admin/storage-rules";

describe("storageTarget", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses Vercel Blob when the token is present", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_x");
    expect(storageTarget()).toBe("blob");
  });

  it("uses Vercel Blob when only the store id is set (OIDC connection)", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("BLOB_STORE_ID", "store_abc");
    expect(storageTarget()).toBe("blob");
  });

  it("falls back to the local public folder otherwise", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("BLOB_STORE_ID", "");
    expect(storageTarget()).toBe("disk");
  });
});

describe("uploadFailureMessage", () => {
  it("explains a read-only disk in terms of what to do", () => {
    const err = Object.assign(new Error("EROFS: read-only file system"), { code: "EROFS" });
    expect(uploadFailureMessage(err)).toMatchObject({ status: 503 });
    expect(uploadFailureMessage(err).message).toMatch(/read-only.*Blob store/);
  });

  it("passes on what Vercel Blob said, with a next step", () => {
    const denied = new Error(
      "Vercel Blob: Access denied, please provide a valid token for this resource.",
    );
    expect(uploadFailureMessage(denied).message).toBe(
      "Vercel Blob storage refused the upload: Access denied, please provide a valid token for this resource. In Vercel, open Storage, connect a public Blob store to this project, then redeploy.",
    );
    const priv = new Error("Vercel Blob: Cannot use public access on a private store.");
    expect(uploadFailureMessage(priv).message).toMatch(/store is private/);
  });

  it("names disk permission and space problems", () => {
    const eacces = Object.assign(new Error("EACCES: permission denied"), { code: "EACCES" });
    expect(uploadFailureMessage(eacces).message).toMatch(/not allowed to write.*EACCES/);
    const full = Object.assign(new Error("no space"), { code: "ENOSPC" });
    expect(uploadFailureMessage(full)).toMatchObject({ status: 507 });
  });

  it("includes the underlying reason for anything else", () => {
    expect(uploadFailureMessage(new Error("boom"))).toEqual({
      message: "Could not save the image (boom).",
      status: 500,
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  MAX_UPLOAD_BYTES,
  uploadFileName,
  validateUpload,
} from "@/lib/admin/upload";

describe("validateUpload", () => {
  it("accepts common image types under the size limit", () => {
    expect(validateUpload("image/jpeg", 1024)).toBeNull();
    expect(validateUpload("image/png", MAX_UPLOAD_BYTES)).toBeNull();
    expect(validateUpload("image/webp", 10)).toBeNull();
  });

  it("rejects other types and oversized files with a clear message", () => {
    expect(validateUpload("application/pdf", 10)).toMatch(/JPEG, PNG, WebP, GIF or AVIF/);
    expect(validateUpload("image/svg+xml", 10)).toMatch(/JPEG, PNG/);
    expect(validateUpload("image/jpeg", MAX_UPLOAD_BYTES + 1)).toMatch(/5 MB/);
    expect(validateUpload("image/jpeg", 0)).toMatch(/empty/i);
  });
});

describe("uploadFileName", () => {
  it("slugifies the original name, adds a hash and the extension for the type", () => {
    const name = uploadFileName("Kurt Throwing (1).JPG", "image/jpeg", "abcdef0123456789");
    expect(name).toBe("kurt-throwing-1-abcdef01.jpg");
  });

  it("never uses the original extension or path separators", () => {
    const name = uploadFileName("../../evil.php", "image/png", "ffffffffffffffff");
    expect(name).toBe("evil-ffffffff.png");
    expect(name).not.toContain("php");
    expect(name).not.toContain("/");
  });

  it("falls back to 'image' for an unusable name", () => {
    expect(uploadFileName("???", "image/webp", "1234567890abcdef")).toBe("image-12345678.webp");
  });
});

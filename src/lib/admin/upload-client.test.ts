import { describe, expect, it } from "vitest";
import { uploadResponseError } from "@/lib/admin/upload-client";

describe("uploadResponseError", () => {
  it("shows the route's own message", () => {
    const body = JSON.stringify({ error: "Images must be 4 MB or smaller." });
    expect(uploadResponseError(413, "Payload Too Large", body)).toBe(
      "Images must be 4 MB or smaller.",
    );
  });

  it("explains a platform 413 that never reached the route", () => {
    const msg = uploadResponseError(413, "", "Request Entity Too Large\nFUNCTION_PAYLOAD_TOO_LARGE");
    expect(msg).toMatch(/too large \(HTTP 413\).*4 MB/);
  });

  it("quotes short plain-text bodies and skips HTML pages", () => {
    expect(uploadResponseError(500, "Internal Server Error", "Something broke")).toBe(
      "Upload failed: the server answered HTTP 500 Internal Server Error (Something broke).",
    );
    expect(uploadResponseError(502, "Bad Gateway", "<html><body>oops</body></html>")).toBe(
      "Upload failed: the server answered HTTP 502 Bad Gateway.",
    );
  });

  it("points at the session for auth failures", () => {
    expect(uploadResponseError(401, "", "")).toMatch(/sign in again/);
  });
});

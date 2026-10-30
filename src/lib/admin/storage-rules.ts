/* Pure decisions about where uploads go and how failures read; the I/O lives in storage.ts. */

export type StorageTarget = "blob" | "disk";

/* Vercel sets BLOB_READ_WRITE_TOKEN when a Blob store is connected to the project.
   Newer connections may set only BLOB_STORE_ID and authenticate with the deployment's
   OIDC token instead; @vercel/blob resolves either. */
export const storageTarget = (): StorageTarget =>
  process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID ? "blob" : "disk";

export type UploadFailure = { message: string; status: number };

const BLOB_SETUP =
  "In Vercel, open Storage, connect a public Blob store to this project, then redeploy.";

/* Turns a storage error into what the admin sees: what went wrong (with the
   underlying reason) and what to do about it. */
export function uploadFailureMessage(err: unknown): UploadFailure {
  const code = (err as { code?: string } | null)?.code;
  const text = err instanceof Error ? err.message.trim() : String(err ?? "").trim();

  if (code === "EROFS" || /read-only/i.test(text)) {
    return {
      message: `This host cannot write files (read-only file system). ${BLOB_SETUP} Or paste an https:// image URL instead.`,
      status: 503,
    };
  }
  if (code === "EACCES" || code === "EPERM") {
    return {
      message: `The server is not allowed to write to public/uploads (${code}). Give the app write access to that folder, or connect Vercel Blob storage.`,
      status: 500,
    };
  }
  if (code === "ENOSPC") {
    return {
      message: "The server's disk is full (ENOSPC). Free some space, or connect Vercel Blob storage.",
      status: 507,
    };
  }

  if (text.startsWith("Vercel Blob:")) {
    const reason = text.replace(/^Vercel Blob:\s*/, "");
    let hint = "";
    if (/private/i.test(reason)) {
      hint = " The connected Blob store is private, so the site could not show the image. Connect a public Blob store instead.";
    } else if (/access denied|valid token|credentials|oidc|store does not exist|suspended/i.test(reason)) {
      hint = ` ${BLOB_SETUP}`;
    } else if (/not available|try again|rate|aborted/i.test(reason)) {
      hint = " Wait a moment and try again.";
    }
    return { message: `Vercel Blob storage refused the upload: ${reason}${hint}`, status: 502 };
  }

  const detail = [code, text].filter(Boolean).join(": ");
  return {
    message: detail ? `Could not save the image (${detail}).` : "Could not save the image.",
    status: 500,
  };
}

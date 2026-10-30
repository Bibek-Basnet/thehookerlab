import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

import { storeImage } from "@/lib/admin/storage";
import { storageTarget, uploadFailureMessage } from "@/lib/admin/storage-rules";
import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  formatBytes,
  uploadFileName,
  validateUpload,
} from "@/lib/admin/upload";
import { getCurrentAdmin } from "@/lib/auth/dal";

const error = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

/* Saves an admin-uploaded image (Vercel Blob when connected, else public/uploads)
   and returns the URL to store on the row. Every failure answers with JSON
   { error } worded for the admin, so the form can show it as is. */
export async function POST(req: Request) {
  let admin;
  try {
    admin = await getCurrentAdmin();
  } catch (err) {
    console.error("[api/admin/upload] session check failed", err);
    /* Runs before the caller is known to be an admin, so the reason stays in the logs. */
    return error(
      "The server could not check your admin session (database or SESSION_SECRET problem; see the server logs). Try again in a moment.",
      503,
    );
  }
  if (!admin) {
    return error("Your admin session has expired. Sign in again, then retry the upload.", 401);
  }

  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 4096) {
    return error(
      `Images must be ${MAX_UPLOAD_LABEL} or smaller (this upload is ${formatBytes(length)}).`,
      413,
    );
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const entry = form.get("file");
    file = entry instanceof File ? entry : null;
  } catch (err) {
    console.error("[api/admin/upload] could not read the form", err);
    return error("The upload did not arrive complete. Check your connection and try again.", 400);
  }
  if (!file) return error("No image was attached. Choose an image file and try again.", 400);

  const problem = validateUpload(file.type, file.size);
  if (problem) return error(`${problem}.`, file.size > MAX_UPLOAD_BYTES ? 413 : 400);

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const hash = createHash("sha256").update(bytes).digest("hex");
    const name = uploadFileName(file.name, file.type, hash);
    const url = await storeImage(name, bytes, file.type);
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error(`[api/admin/upload] store failed (${storageTarget()})`, err);
    const { message, status } = uploadFailureMessage(err);
    return error(message, status);
  }
}

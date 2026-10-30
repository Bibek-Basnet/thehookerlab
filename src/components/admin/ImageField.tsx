"use client";

import { useRef, useState } from "react";
import { CheckCircle, UploadSimple, WarningCircle, X } from "@phosphor-icons/react";

import {
  NETWORK_ERROR,
  prepareImage,
  preflightError,
  uploadResponseError,
} from "@/lib/admin/upload-client";
import { ACCEPTED_TYPES } from "@/lib/admin/upload";
import { inputClass } from "./fields";

type Notice = { kind: "error" | "success"; title: string; text: string };

/* Upload button + preview, with the stored path still editable for https URLs. */
export default function ImageField({
  name,
  initial,
  placeholder,
}: {
  name: string;
  initial: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState<null | "preparing" | "uploading">(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const fail = (file: File, text: string) =>
    setNotice({ kind: "error", title: `Could not upload “${file.name}”`, text });

  const upload = async (original: File) => {
    setNotice(null);
    try {
      setBusy("preparing");
      let file: File;
      try {
        file = await prepareImage(original);
      } catch (err) {
        fail(original, err instanceof Error ? err.message : String(err));
        return;
      }
      const tooBig = preflightError(file);
      if (tooBig) {
        fail(original, tooBig);
        return;
      }

      setBusy("uploading");
      const body = new FormData();
      body.append("file", file);
      let res: Response;
      try {
        res = await fetch("/api/admin/upload", { method: "POST", body });
      } catch {
        fail(original, NETWORK_ERROR);
        return;
      }
      const text = await res.text().catch(() => "");
      let url: string | undefined;
      try {
        url = (JSON.parse(text) as { url?: string }).url;
      } catch {
        /* handled below */
      }
      if (!res.ok || !url) {
        fail(original, uploadResponseError(res.status, res.statusText, text));
        return;
      }

      setValue(url);
      setNotice({
        kind: "success",
        title: "Image uploaded",
        text: "Click Save to put it on the site.",
      });
    } finally {
      setBusy(null);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const broken = value !== "" && brokenSrc === value;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {value && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary URL
          <img
            key={value}
            src={value}
            alt=""
            onError={() => setBrokenSrc(value)}
            className="h-20 w-20 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div
            className={`grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-dashed ${broken ? "border-accent text-accent" : "border-line"}`}
          >
            {broken && <WarningCircle size={22} aria-hidden="true" />}
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            name={name}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setNotice(null);
            }}
            placeholder={placeholder ?? "/uploads/… or https://…"}
            className={inputClass}
          />
          <label
            className={`inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-mist has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-bone ${busy ? "cursor-wait opacity-70" : "cursor-pointer hover:text-bone"}`}
          >
            <UploadSimple size={14} />
            {busy === "preparing"
              ? "Preparing image…"
              : busy === "uploading"
                ? "Uploading…"
                : value
                  ? "Replace image"
                  : "Upload image"}
            <input
              ref={fileInput}
              type="file"
              accept={[...ACCEPTED_TYPES, "image/heic", "image/heif"].join(",")}
              className="sr-only"
              disabled={busy !== null}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
        </div>
      </div>

      {broken && !notice && (
        <p role="alert" className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-bone">
          The image at this address could not be loaded. Upload a new image or fix the path
          before saving, or the site will show a broken picture.
        </p>
      )}

      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm text-bone ${
            notice.kind === "error" ? "border-accent/50 bg-accent/10" : "border-line bg-steel"
          }`}
        >
          {notice.kind === "error" ? (
            <WarningCircle size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
          ) : (
            <CheckCircle size={18} className="mt-0.5 shrink-0 text-bone" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <p className="font-medium break-words">{notice.title}</p>
            <p className="mt-1 break-words text-bone/80">{notice.text}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="shrink-0 text-mist hover:text-bone"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

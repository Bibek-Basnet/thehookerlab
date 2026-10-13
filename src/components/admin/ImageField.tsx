"use client";

import { useRef, useState } from "react";
import { UploadSimple } from "@phosphor-icons/react";

import { inputClass } from "./fields";

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setValue(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary URL
          <img src={value} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-lg border border-dashed border-line" />
        )}
        <div className="flex-1 space-y-2">
          <input
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder ?? "/uploads/… or https://…"}
            className={inputClass}
          />
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-mist hover:text-bone">
            <UploadSimple size={14} />
            {busy ? "Uploading" : "Upload image"}
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

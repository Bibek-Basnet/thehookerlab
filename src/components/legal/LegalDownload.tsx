"use client";

import { useState } from "react";
import { DownloadSimple } from "@phosphor-icons/react";

import type { LegalSlug } from "@/lib/legal";

export default function LegalDownload({
  slug,
  title,
}: {
  slug: LegalSlug;
  title: string;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const download = async () => {
    setBusy(true);
    setFailed(false);

    try {
      /* The PDF library loads only when someone asks for the PDF */
      const { downloadLegalPdf } = await import("@/lib/legal-pdf");
      downloadLegalPdf(slug);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={download}
        disabled={busy}
        aria-label={`Download ${title} as a PDF`}
        className="inline-flex items-center gap-3 border-2 border-ink bg-white px-6 py-3.5 text-base font-bold text-ink transition-colors duration-200 hover:bg-ink hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-wait disabled:opacity-60"
      >
        <DownloadSimple size={20} weight="bold" aria-hidden="true" />
        {busy ? "Preparing PDF" : "Download PDF"}
      </button>

      {failed && (
        <p role="alert" className="mt-3 text-base font-bold">
          The PDF could not be created. Please try again.
        </p>
      )}
    </div>
  );
}
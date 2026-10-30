import type { Metadata } from "next";

import LegalDocument from "@/components/legal/LegalDocument";
import { refundAndCancellation } from "@/data/legal/refund-and-cancellation";

export const metadata: Metadata = {
  title: refundAndCancellation.title,
  description: refundAndCancellation.description,
  alternates: { canonical: "/refund-and-cancellation" },
  robots: { index: true, follow: true },
};

export default function RefundAndCancellationPage() {
  return <LegalDocument doc={refundAndCancellation} />;
}
import type { Metadata } from "next";

import LegalDocument from "@/components/legal/LegalDocument";
import { termsAndConditions } from "@/data/legal/terms-and-conditions";

export const metadata: Metadata = {
  title: termsAndConditions.title,
  description: termsAndConditions.description,
  alternates: { canonical: "/terms-and-conditions" },
  robots: { index: true, follow: true },
};

export default function TermsAndConditionsPage() {
  return <LegalDocument doc={termsAndConditions} />;
}
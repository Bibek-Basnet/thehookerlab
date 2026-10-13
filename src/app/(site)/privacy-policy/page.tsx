import type { Metadata } from "next";

import LegalDocument from "@/components/legal/LegalDocument";
import { privacyPolicy } from "@/data/legal/privacy-policy";

export const metadata: Metadata = {
  title: privacyPolicy.title,
  description: privacyPolicy.description,
  alternates: { canonical: "/privacy-policy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPolicyPage() {
  return <LegalDocument doc={privacyPolicy} />;
}
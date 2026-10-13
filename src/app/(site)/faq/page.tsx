import type { Metadata } from "next";

import FAQ from "@/components/sections/FAQ";
import { faq } from "@/data/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about hooker coaching with The Hooker Lab: who it is for, how sessions work, booking and what happens next.",
  alternates: { canonical: "/faq" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQ />
    </>
  );
}
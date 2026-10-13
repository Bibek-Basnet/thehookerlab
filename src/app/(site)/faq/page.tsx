import type { Metadata } from "next";

import FAQ from "@/components/sections/FAQ";
import { getFaqSection } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Answers to common questions about hooker coaching with The Hooker Lab: who it is for, how sessions work, booking and what happens next.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const data = await getFaqSection();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FAQ data={data} />
    </>
  );
}

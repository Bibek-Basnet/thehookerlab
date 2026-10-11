import { Libre_Baskerville } from "next/font/google";

import LegalDownload from "@/components/legal/LegalDownload";
import { legal } from "@/data/legal/shared";
import { itemLabel, numberSections, type LegalDoc } from "@/lib/legal";
import { cn } from "@/lib/utils";

const serif = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thehookerlab.co.nz";

/* Site headings are uppercase display type. Legal headings use the document serif. */
const headingReset =
  "[font-family:inherit] font-bold normal-case tracking-normal leading-tight";

const bodyText = "text-[1.125rem] leading-8 md:text-[1.1875rem] md:leading-[2.1rem]";

const linkClass =
  "underline decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink";

export default function LegalDocument({ doc }: { doc: LegalDoc }) {
  const sections = numberSections(doc.sections);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: doc.title,
    description: doc.description,
    url: `${SITE_URL}/${doc.slug}`,
    dateModified: legal.updatedISO,
    inLanguage: "en-NZ",
  };

  const details = [
    { label: "Effective date", value: legal.effectiveDate },
    { label: "Last updated", value: legal.lastUpdated },
    { label: "Provider", value: legal.operatorLine },
    { label: "Contact", value: legal.email },
  ];

  return (
    <>
      {/* Black band keeps the fixed navbar readable above the white document */}
      <div aria-hidden="true" className="h-[72px] bg-ink md:h-24" />

      <div
        className={cn(
          serif.className,
          "bg-white text-ink selection:bg-ink selection:text-white"
        )}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <article
          aria-labelledby="legal-title"
          className="mx-auto max-w-3xl px-5 py-14 md:px-8 md:py-20"
        >
          {/* Title block */}
          <header>
            <p className="text-sm font-bold uppercase tracking-[0.2em]">
              {legal.brand}
            </p>
            <h1
              id="legal-title"
              className={cn(
                headingReset,
                "mt-5 text-4xl md:text-5xl"
              )}
            >
              {doc.title}
            </h1>

            <dl className="mt-10 divide-y divide-ink border-y-2 border-ink">
              {details.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6"
                >
                  <dt className="text-base font-bold">{row.label}</dt>
                  <dd className="text-base md:text-lg">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <LegalDownload slug={doc.slug} title={doc.title} />
              <p className="text-base">
                Download a copy of this document as a PDF.
              </p>
            </div>
          </header>

          {/* Introduction */}
          <div className={cn("mt-12 space-y-5", bodyText)}>
            {doc.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* Contents */}
          <nav
            aria-labelledby="legal-contents"
            className="mt-12 border-2 border-ink p-6 md:p-8"
          >
            <h2
              id="legal-contents"
              className={cn(headingReset, "text-xl md:text-2xl")}
            >
              Contents
            </h2>
            <ol className="mt-5 grid gap-x-10 gap-y-2.5 text-base md:grid-cols-2 md:text-lg">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={linkClass}>
                    {section.number}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="mt-14 space-y-14 md:mt-16 md:space-y-16">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                className="scroll-mt-28 border-t-2 border-ink pt-8"
              >
                <h2
                  id={`${section.id}-title`}
                  className={cn(headingReset, "text-2xl md:text-3xl")}
                >
                  {section.number}. {section.title}
                </h2>

                <ol className={cn("mt-7 space-y-6", bodyText)}>
                  {section.clauses.map((clause) => (
                    <li
                      key={clause.label}
                      className="grid grid-cols-[3.25rem_1fr] gap-x-2 md:grid-cols-[4rem_1fr]"
                    >
                      <span className="font-bold tabular-nums">
                        {clause.label}
                      </span>
                      <div>
                        <p>{clause.text}</p>

                        {clause.items.length > 0 && (
                          <ol className="mt-4 space-y-3">
                            {clause.items.map((item, i) => (
                              <li
                                key={item}
                                className="grid grid-cols-[2.5rem_1fr] gap-x-2"
                              >
                                <span>{itemLabel(i)}</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>

          {/* End of document */}
          <footer className="mt-16 border-t-2 border-ink pt-8 text-center">
            <p className="text-base font-bold uppercase tracking-[0.2em]">
              End of {doc.title}
            </p>
            <div className="mt-6 flex justify-center">
              <LegalDownload slug={doc.slug} title={doc.title} />
            </div>
            <p className="mt-6">
              <a href="#legal-title" className={cn("text-base", linkClass)}>
                Back to the top
              </a>
            </p>
          </footer>
        </article>
      </div>
    </>
  );
}
"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Check } from "@phosphor-icons/react";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { workshops } from "@/data/workshops";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thehookerlab.co.nz";

const { topics, audiences } = workshops;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Hooker Workshops",
  serviceType: "Specialist rugby hooker coaching workshops",
  description: workshops.intro,
  provider: { "@id": `${SITE_URL}/#organization` },
  areaServed: { "@type": "Country", name: "New Zealand" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Workshop focus areas",
    itemListElement: topics.map((t) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: t.label,
        description: t.text,
      },
    })),
  },
};

/* Tick box or radio dot shown on every option card */
function Indicator({ on, round }: { on: boolean; round?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "mt-0.5 grid size-6 shrink-0 place-items-center border transition-colors duration-300",
        round ? "rounded-full" : "rounded-md",
        on
          ? "border-accent bg-accent text-bone"
          : "border-ink/25 text-transparent"
      )}
    >
      <Check size={14} weight="bold" />
    </span>
  );
}

type OptionCardProps = {
  label: string;
  text: string;
  active: boolean;
  role: "radio" | "checkbox";
  onClick: () => void;
  className?: string;
};

function OptionCard({
  label,
  text,
  active,
  role,
  onClick,
  className,
}: OptionCardProps) {
  return (
    <div data-ws-card className={cn("h-full", className)}>
      <motion.button
        type="button"
        role={role}
        aria-checked={active}
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group flex h-full w-full flex-col rounded-2xl border p-4 text-left transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:p-5",
          active
            ? "border-ink bg-ink text-bone"
            : "border-ink/15 bg-white text-ink hover:-translate-y-0.5 hover:border-ink/40 hover:shadow-[0_18px_40px_-26px_rgba(0,0,0,0.35)]"
        )}
      >
        <span className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "block font-display text-xl font-bold uppercase leading-tight transition-colors duration-300 md:text-2xl xl:min-h-[3.4rem]",
              !active && "group-hover:text-accent"
            )}
          >
            {label}
          </span>
          <Indicator on={active} round={role === "radio"} />
        </span>

        {/* Mobile: description opens only when chosen. Desktop: always shown. */}
        <span
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr]",
            active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <span className="overflow-hidden">
            <span
              className={cn(
                "block pt-2.5 text-[17px] font-medium leading-snug transition-colors duration-300 md:pt-3 md:text-lg",
                active ? "text-bone/85" : "text-ink/75"
              )}
            >
              {text}
            </span>
          </span>
        </span>
      </motion.button>
    </div>
  );
}

type StepProps = {
  number: string;
  title: { plain: string; accent: string };
  titleEnd?: string;
  hint: string;
  complete?: boolean;
  action?: ReactNode;
  children: ReactNode;
};

function Step({
  number,
  title,
  titleEnd,
  hint,
  complete,
  action,
  children,
}: StepProps) {
  return (
    <div
      data-ws-step
      className="rounded-3xl border border-ink/10 bg-white p-5 md:p-10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-full font-display text-lg text-bone transition-colors duration-300",
              complete ? "bg-accent" : "bg-ink"
            )}
          >
            {complete ? <Check size={18} weight="bold" /> : number}
          </span>
          <div>
            <h3 className="text-2xl leading-tight md:text-3xl">
              {title.plain} <span className="text-accent">{title.accent}</span>
              {titleEnd ? ` ${titleEnd}` : ""}
            </h3>
            <p className="mt-1 text-base font-medium text-ink/70 md:text-lg">
              {hint}
            </p>
          </div>
        </div>
        {action}
      </div>

      <div className="mt-6 md:mt-8">{children}</div>
    </div>
  );
}

export default function Workshops() {
  const sectionRef = useRef<HTMLElement>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [audience, setAudience] = useState<string | null>(null);

  const toggleTopic = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const allSelected = selected.length === topics.length;
  const toggleAll = () =>
    setSelected(allSelected ? [] : topics.map((t) => t.id));

  const reset = () => {
    setSelected([]);
    setAudience(null);
  };

  /* Chosen topics in their original order */
  const chosen = topics.filter((t) => selected.includes(t.id));
  const audienceLabel = audiences.find((a) => a.id === audience)?.label;
  const hasSelection = chosen.length > 0 || audience !== null;

  /* The Contact section will read these to prefill the enquiry */
  const params = new URLSearchParams();
  if (chosen.length) params.set("workshop", chosen.map((t) => t.id).join(","));
  if (audience) params.set("for", audience);
  const query = params.toString();
  const enquiryHref = `/${query ? `?${query}` : ""}#contact`;

  const liveSummary = hasSelection
    ? `Workshop${audienceLabel ? ` for ${audienceLabel}` : ""}${
        chosen.length
          ? ` focused on ${chosen.map((t) => t.label).join(", ")}`
          : ""
      }.`
    : "No workshop options chosen yet.";

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-ws-pill]",
          { autoAlpha: 0, x: -20 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-ws-pill]", start: "top 90%" },
          }
        );
        gsap.fromTo(
          "[data-ws-head-word]",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.14,
            scrollTrigger: { trigger: "[data-ws-heading]", start: "top 88%" },
          }
        );
        gsap.fromTo(
          "[data-ws-intro]",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-ws-intro]", start: "top 90%" },
          }
        );

        gsap.fromTo(
          "[data-ws-info]",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: "[data-ws-included]", start: "top 92%" },
          }
        );

        /* Each step rises in, then its cards follow */
        gsap.utils.toArray<HTMLElement>("[data-ws-step]").forEach((step) => {
          const cards = gsap.utils.selector(step)("[data-ws-card]");
          const tl = gsap.timeline({
            scrollTrigger: { trigger: step, start: "top 88%" },
          });

          tl.fromTo(
            step,
            { autoAlpha: 0, y: 40 },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" },
            0
          );

          if (cards.length) {
            tl.fromTo(
              cards,
              { autoAlpha: 0, y: 24 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.06,
              },
              0.25
            );
          }
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="workshops"
      aria-labelledby="workshops-heading"
      className="relative bg-paper py-16 text-ink md:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Header */}
        <span
          data-ws-pill
          className="inline-block rounded-full bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-bone"
        >
          {workshops.eyebrow}
        </span>

        <h2
          id="workshops-heading"
          data-ws-heading
          className="mt-6 flex items-baseline gap-[0.28em] whitespace-nowrap text-[clamp(1.75rem,4.2vw,3rem)] leading-none"
        >
          {workshops.headline.map((word, i) => (
            <span key={word} className="block overflow-hidden py-[0.08em]">
              <span
                data-ws-head-word
                className={cn("block", i === 1 && "text-accent")}
              >
                {word}
              </span>
            </span>
          ))}
        </h2>

        <p
          data-ws-intro
          className="mt-5 max-w-2xl text-lg font-medium leading-relaxed text-ink/75 md:mt-6 md:text-xl"
        >
          {workshops.intro}
        </p>

        {/* Included in every workshop: swipeable on phones, grid from tablet up */}
        <ul
          data-ws-included
          className="-mx-5 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:mt-12 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden"
        >
          {workshops.included.map(({ title, text }) => (
            <li
              key={title}
              data-ws-info
              className="group w-[82%] shrink-0 snap-start sm:w-auto"
            >
              <div className="h-full rounded-2xl border border-ink/10 bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-ink/30 md:p-6">
                <p className="font-display text-xl font-bold uppercase leading-tight transition-colors duration-300 group-hover:text-accent md:text-2xl xl:min-h-[3.4rem]">
                  {title}
                </p>
                <p className="mt-2.5 text-[17px] font-medium leading-snug text-ink/75 md:mt-3 md:text-lg">
                  {text}
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* Steps */}
        <div className="mt-4 space-y-4 md:mt-6 md:space-y-6">
          {/* Step 1 */}
          <Step
            number="1"
            title={workshops.audienceStep.title}
            hint={workshops.audienceStep.hint}
            complete={audience !== null}
          >
            <div
              role="radiogroup"
              aria-label={`${workshops.audienceStep.title.plain} ${workshops.audienceStep.title.accent}`}
              className="grid gap-3 md:grid-cols-6 xl:grid-cols-5"
            >
              {audiences.map((a, i) => (
                <OptionCard
                  key={a.id}
                  label={a.label}
                  text={a.text}
                  role="radio"
                  active={audience === a.id}
                  onClick={() => setAudience(audience === a.id ? null : a.id)}
                  className={
                    i < 3
                      ? "md:col-span-2 xl:col-span-1"
                      : "md:col-span-3 xl:col-span-1"
                  }
                />
              ))}
            </div>
          </Step>

          {/* Step 2 */}
          <Step
            number="2"
            title={workshops.focusStep.title}
            titleEnd={workshops.focusStep.titleEnd}
            hint={workshops.focusStep.hint}
            complete={chosen.length > 0}
            action={
              <button
                type="button"
                onClick={toggleAll}
                className="shrink-0 rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold transition-colors duration-300 hover:border-ink hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {allSelected ? "Clear all" : "Select all"}
              </button>
            }
          >
            <div
              role="group"
              aria-label="Workshop focus areas"
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
            >
              {topics.map((t) => (
                <OptionCard
                  key={t.id}
                  label={t.label}
                  text={t.text}
                  role="checkbox"
                  active={selected.includes(t.id)}
                  onClick={() => toggleTopic(t.id)}
                />
              ))}

              <div data-ws-card className="h-full">
                <div className="flex h-full flex-col justify-center p-4 md:p-5">
                  <p className="font-display text-xl font-bold uppercase leading-tight md:text-2xl">
                    {workshops.help.title}
                  </p>
                  <p className="mt-2.5 text-[17px] font-medium leading-snug text-ink/75 md:text-lg">
                    {workshops.help.text}
                  </p>
                </div>
              </div>
            </div>
          </Step>

          {/* Step 3 */}
          <Step
            number="3"
            title={workshops.reviewStep.title}
            hint={workshops.reviewStep.hint}
          >
            <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
                  {workshops.summary.title}
                </h4>

                <dl className="mt-4 divide-y divide-ink/10 rounded-2xl border border-ink/15">
                  <div className="grid gap-1.5 p-4 sm:grid-cols-[8rem_1fr] sm:gap-6 md:p-5">
                    <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60 sm:pt-1">
                      {workshops.summary.group}
                    </dt>
                    <dd className="text-xl font-semibold">
                      {audienceLabel ?? (
                        <span className="font-medium text-ink/45">
                          {workshops.summary.groupEmpty}
                        </span>
                      )}
                    </dd>
                  </div>

                  <div className="grid gap-2 p-4 sm:grid-cols-[8rem_1fr] sm:gap-6 md:p-5">
                    <dt className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60 sm:pt-1.5">
                      {workshops.summary.focus}
                    </dt>
                    <dd>
                      {chosen.length ? (
                        <ul className="flex flex-wrap gap-2">
                          {chosen.map((t) => (
                            <li
                              key={t.id}
                              className="rounded-full bg-ink px-3.5 py-1.5 text-[15px] font-semibold text-bone"
                            >
                              {t.label}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xl font-medium text-ink/45">
                          {workshops.summary.focusEmpty}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="lg:col-span-5">
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
                  {workshops.nextTitle}
                </h4>

                <ol className="mt-4 space-y-3 md:space-y-4">
                  {workshops.next.map((item, i) => (
                    <li key={item.title} className="flex items-start gap-4">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full border border-ink/25 font-display text-base">
                        {i + 1}
                      </span>
                      <div>
                        <p className="pt-0.5 text-lg font-semibold leading-snug md:pt-0">
                          {item.title}
                        </p>
                        <p className="mt-0.5 hidden text-[17px] font-medium leading-snug text-ink/75 md:block">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-ink/10 pt-6 md:mt-10 md:pt-8">
              <Link
                href={enquiryHref}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-accent px-8 py-4 text-base font-semibold text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-0 translate-y-full rounded-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
                />
                <span className="relative">
                  {chosen.length ? workshops.cta.chosen : workshops.cta.empty}
                </span>
              </Link>

              <button
                type="button"
                onClick={reset}
                tabIndex={hasSelection ? 0 : -1}
                aria-hidden={!hasSelection}
                className={cn(
                  "text-base font-semibold text-ink/60 underline-offset-4 transition-all duration-300 hover:text-accent hover:underline focus-visible:text-accent focus-visible:outline-none",
                  hasSelection ? "opacity-100" : "pointer-events-none opacity-0"
                )}
              >
                Reset choices
              </button>
            </div>
          </Step>
        </div>

        <p className="sr-only" aria-live="polite">
          {liveSummary}
        </p>
      </div>
    </section>
  );
}
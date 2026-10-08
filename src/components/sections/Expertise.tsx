"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { expertise } from "@/data/expertise";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thehookerlab.co.nz";

const pillars = expertise.pillars;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "The Hooker Lab",
  knowsAbout: pillars.flatMap((p) => p.skills.map((s) => s.name)),
};

const chevron = (flip?: boolean) => (
  <svg
    viewBox="0 0 20 20"
    className={cn("h-4 w-4", flip && "rotate-180")}
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 4l6 6-6 6" />
  </svg>
);

export default function Expertise() {
  const [active, setActive] = useState(0);
  const [skill, setSkill] = useState<number[]>(() => pillars.map(() => 0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const intent = (i: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(i), 110);
  };
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  const pick = (p: number, i: number) =>
    setSkill((prev) => prev.map((v, idx) => (idx === p ? i : v)));

  return (
    <section
      id="expertise"
      aria-labelledby="expertise-heading"
      className="bg-paper py-16 text-ink md:py-24"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-350 px-5 md:px-10">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-block rounded-full bg-ink px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-bone">
              {expertise.eyebrow}
            </span>
            <h2
              id="expertise-heading"
              className="mt-6 text-[clamp(2.25rem,6vw,4.5rem)] leading-none"
            >
              {expertise.headline.plain}{" "}
              <span className="text-accent">{expertise.headline.accent}</span>
            </h2>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink/60 lg:pb-2">
            <span className="lg:hidden">Tap a pillar to explore it</span>
          </p>
        </div>

        {/* Pillars */}
        <div className="mt-10 flex flex-col gap-3 md:mt-12 lg:h-[clamp(560px,80vh,720px)] lg:flex-row">
          {pillars.map((pillar, p) => {
            const isActive = active === p;
            const current = Math.min(skill[p], pillar.skills.length - 1);
            const item = pillar.skills[current];
            const total = pillar.skills.length;

            return (
              <div
                key={pillar.id}
                role="group"
                aria-label={pillar.word}
                onMouseEnter={() => intent(p)}
                onMouseLeave={cancel}
                className={cn(
                  "group/panel relative isolate min-w-0 overflow-hidden rounded-3xl bg-ink transition-[flex-grow,height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:h-auto lg:basis-0",
                  isActive ? "h-[40rem] lg:grow-[2.6]" : "h-28 lg:grow-[1]"
                )}
              >
                {/* Image */}
                <Image
                  src={pillar.image}
                  alt={pillar.alt}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className={cn(
                    "-z-10 object-cover transition duration-700 motion-reduce:transition-none",
                    isActive
                      ? "scale-100 brightness-100"
                      : "scale-110 brightness-50 group-hover/panel:brightness-75"
                  )}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 bg-linear-to-t from-ink/95 via-ink/55 to-ink/25"
                />

                {/* Collapsed state */}
                <button
                  type="button"
                  onClick={() => setActive(p)}
                  aria-expanded={isActive}
                  aria-label={`Explore ${pillar.word}, ${total} skills`}
                  className={cn(
                    "absolute inset-0 flex items-center justify-between gap-4 p-5 text-left text-bone transition-[opacity,visibility] duration-300 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent motion-reduce:transition-none lg:flex-col lg:items-start lg:p-6",
                    isActive
                      ? "pointer-events-none invisible opacity-0"
                      : "visible cursor-pointer opacity-100 delay-200"
                  )}
                >
                  <span className="order-2 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bone text-ink transition duration-300 group-hover/panel:rotate-90 group-hover/panel:bg-accent group-hover/panel:text-bone lg:order-1">
                    <svg
                      viewBox="0 0 20 20"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M10 4v12M4 10h12" />
                    </svg>
                  </span>
                  <span className="order-1 lg:order-2">
                    <span className="block font-display text-4xl font-extrabold uppercase leading-none lg:rotate-180 lg:text-6xl lg:[writing-mode:vertical-rl]">
                      {pillar.word}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-bone/80 lg:hidden">
                      {total} skills
                    </span>
                  </span>
                </button>

                {/* Expanded state */}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col justify-between p-5 text-bone transition-[opacity,visibility] duration-500 motion-reduce:transition-none lg:p-8",
                    isActive
                      ? "visible opacity-100 delay-300"
                      : "invisible opacity-0"
                  )}
                >
                  {/* Title block - fixed height, clips cleanly, hugs top */}
                  <div className="min-h-0 shrink-0">
                    <h3 className="font-display text-[clamp(2.5rem,5.5vw,5rem)] font-extrabold uppercase leading-[0.9] tracking-tight">
                      {pillar.word}
                    </h3>
                    <p className="mt-3 max-w-lg text-base font-medium leading-snug text-bone/95 md:text-lg">
                      {pillar.summary}
                    </p>
                  </div>

                  {/* Skills block - takes remaining space */}
                  <div className="mt-6 grid min-h-0 flex-1 gap-3 lg:grid-cols-[14rem_1fr]">
                    {/* Skill picker */}
                    <ul className="flex flex-wrap content-start gap-2 lg:flex-col lg:flex-nowrap lg:gap-1.5">
                      {pillar.skills.map((s, i) => (
                        <li key={s.name} className="lg:w-full">
                          <button
                            type="button"
                            onClick={() => pick(p, i)}
                            aria-pressed={current === i}
                            className={cn(
                              "w-full rounded-full px-4 py-2 text-left font-display text-base font-extrabold uppercase leading-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone motion-reduce:transition-none md:text-lg",
                              current === i
                                ? "bg-accent text-bone"
                                : "bg-bone/15 text-bone hover:bg-bone/30"
                            )}
                          >
                            {s.name}
                          </button>
                        </li>
                      ))}
                    </ul>

                    {/* Skill detail */}
                    <div className="flex min-h-0 flex-col overflow-auto rounded-2xl bg-bone/10 p-5 backdrop-blur-md md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-display text-2xl font-extrabold uppercase leading-tight md:text-3xl">
                          {item.name}
                        </h4>
                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            aria-label="Previous skill"
                            onClick={() =>
                              pick(p, (current - 1 + total) % total)
                            }
                            className="grid h-9 w-9 place-items-center rounded-full bg-bone/15 transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
                          >
                            {chevron(true)}
                          </button>
                          <button
                            type="button"
                            aria-label="Next skill"
                            onClick={() => pick(p, (current + 1) % total)}
                            className="grid h-9 w-9 place-items-center rounded-full bg-bone/15 transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone"
                          >
                            {chevron()}
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 text-base font-medium leading-snug text-bone/95 md:text-lg">
                        {item.detail}
                      </p>

                      <ul className="mt-4 space-y-2 text-[15px] font-medium leading-snug text-bone/95 md:text-base">
                        {item.focus.map((f) => (
                          <li key={f} className="flex gap-3">
                            <span
                              aria-hidden="true"
                              className="mt-[0.55em] h-2 w-2 shrink-0 rounded-full bg-accent"
                            />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <p className="mt-auto pt-4 text-sm font-semibold text-bone/75">
                        Skill {current + 1} of {total}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
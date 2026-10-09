"use client";

import { useRef, useState } from "react";
import Image from "next/image";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { faq } from "@/data/faq";

export default function FAQ() {
  const rootRef = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  const [open, setOpen] = useState<string | null>(faq.items[0].id);

  /* Entrance: hero timeline and parallax, then cards rise in on scroll */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay: 0.1, defaults: { ease: "power3.out" } })
          .fromTo(
            "[data-faq-img]",
            { scale: 1.12 },
            { scale: 1, duration: 2, ease: "power2.out" },
            0
          )
          .fromTo(
            "[data-faq-pill]",
            { autoAlpha: 0, x: -20 },
            { autoAlpha: 1, x: 0, duration: 0.7 },
            0.1
          )
          .fromTo(
            "[data-faq-word]",
            { yPercent: 115 },
            { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.14 },
            0.2
          )
          .fromTo(
            "[data-faq-intro]",
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.9 },
            0.55
          );

        /* Background drifts slowly as the hero scrolls away */
        gsap.to("[data-faq-bg]", {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-faq-hero]",
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        gsap.set("[data-faq-item]", { autoAlpha: 0, y: 32 });
        ScrollTrigger.batch("[data-faq-item]", {
          start: "top 92%",
          once: true,
          onEnter: (els) =>
            gsap.to(els, {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
              overwrite: true,
              clearProps: "transform",
            }),
        });

      });
    },
    { scope: rootRef }
  );

  /* Accordion: GSAP drives the height, fade and icon turn */
  useGSAP(
    () => {
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const animate = ready.current && !reduce;

      const go = (
        target: string,
        vars: gsap.TweenVars,
        duration: number,
        ease = "power3.inOut"
      ) =>
        animate
          ? gsap.to(target, { ...vars, duration, ease, overwrite: "auto" })
          : gsap.set(target, vars);

      faq.items.forEach((item) => {
        const isOpen = open === item.id;

        go(
          `[data-faq-panel="${item.id}"]`,
          {
            height: isOpen ? "auto" : 0,
            autoAlpha: isOpen ? 1 : 0,
            onComplete: () => {
              ScrollTrigger.refresh();
            },
          },
          0.6
        );
        go(
          `[data-faq-icon="${item.id}"]`,
          { rotate: isOpen ? 45 : 0 },
          0.5,
          "power3.out"
        );

        if (isOpen && animate) {
          gsap.fromTo(
            `[data-faq-text="${item.id}"]`,
            { y: 12, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.18, ease: "power3.out" }
          );
        }
      });

      ready.current = true;
    },
    { scope: rootRef, dependencies: [open] }
  );

  return (
    <div ref={rootRef}>
      {/* Hero with background image */}
      <section
        data-faq-hero
        aria-labelledby="faq-heading"
        className="relative isolate flex min-h-[68svh] items-end overflow-hidden bg-ink text-bone md:min-h-[72svh]"
      >
        <div
          data-faq-bg
          aria-hidden="true"
          className="absolute inset-x-0 -top-[8%] -z-10 h-[116%]"
        >
          <div data-faq-img className="absolute inset-0">
            <Image
              src={faq.heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              quality={85}
              className="object-cover"
            />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/55 to-ink/40"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-r from-ink/60 via-transparent to-transparent"
        />

        <div className="mx-auto w-full max-w-[1400px] px-5 pb-12 pt-40 md:px-10 md:pb-20">
          <span
            data-faq-pill
            className="inline-block rounded-full bg-bone px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-ink"
          >
            {faq.eyebrow}
          </span>

          <h1
            id="faq-heading"
            className="mt-6 flex flex-wrap items-baseline gap-x-[0.28em] text-[clamp(2.75rem,9vw,7.5rem)] leading-none"
          >
            {faq.headline.map((word, i) => (
              <span key={word} className="block overflow-hidden py-[0.08em]">
                <span
                  data-faq-word
                  className={cn("block", i === 1 && "text-accent")}
                >
                  {word}
                </span>
              </span>
            ))}
          </h1>

          <p
            data-faq-intro
            className="mt-5 max-w-xl text-lg leading-relaxed text-bone/80 md:text-xl"
          >
            {faq.intro}
          </p>
        </div>
      </section>

      {/* Questions */}
      <section
        aria-label="Frequently asked questions"
        className="bg-paper py-14 text-ink md:py-24"
      >
        <div className="mx-auto max-w-4xl px-5 md:px-10">
          {/* Questions */}
          <ul className="space-y-3">
            {faq.items.map((item, i) => {
              const isOpen = open === item.id;

              return (
                <li key={item.id} data-faq-item>
                  <div
                    className={cn(
                      "group rounded-2xl transition-[background-color,box-shadow] duration-500",
                      isOpen
                        ? "bg-ink text-bone"
                        : "bg-white text-ink hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.35)]"
                    )}
                  >
                    <h2 className="text-lg md:text-2xl">
                      <button
                        type="button"
                        id={`faq-q-${item.id}`}
                        aria-expanded={isOpen}
                        aria-controls={`faq-a-${item.id}`}
                        onClick={() => setOpen(isOpen ? null : item.id)}
                        className="flex w-full items-center gap-4 rounded-2xl px-5 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:gap-5 md:px-7 md:py-6"
                      >
                        <span className="font-display text-base font-bold text-accent md:text-lg">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={cn(
                            "flex-1 leading-tight transition-colors duration-300",
                            !isOpen && "group-hover:text-accent"
                          )}
                        >
                          {item.question}
                        </span>
                        <span
                          className={cn(
                            "grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300",
                            isOpen
                              ? "bg-accent text-bone"
                              : "bg-paper text-ink group-hover:bg-accent group-hover:text-bone"
                          )}
                        >
                          <svg
                            data-faq-icon={item.id}
                            viewBox="0 0 20 20"
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            aria-hidden="true"
                          >
                            <path d="M10 4v12M4 10h12" />
                          </svg>
                        </span>
                      </button>
                    </h2>

                    <div
                      id={`faq-a-${item.id}`}
                      role="region"
                      aria-labelledby={`faq-q-${item.id}`}
                      data-faq-panel={item.id}
                      className="invisible h-0 overflow-hidden"
                    >
                      <div
                        data-faq-text={item.id}
                        className="px-5 pb-6 pl-[3.25rem] md:px-7 md:pb-7 md:pl-[4.25rem]"
                      >
                        <p className="max-w-2xl text-base leading-relaxed text-bone/80 md:text-lg">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
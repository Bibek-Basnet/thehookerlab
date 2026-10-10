"use client";

import { useRef } from "react";
import Image from "next/image";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { philosophy } from "@/data/philosophy";

export default function Philosophy() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-ph-pill]",
          { autoAlpha: 0, x: -20 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-ph-pill]", start: "top 90%" },
          }
        );
        gsap.fromTo(
          "[data-ph-word]",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.14,
            scrollTrigger: { trigger: "[data-ph-heading]", start: "top 88%" },
          }
        );
        gsap.fromTo(
          "[data-ph-text]",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: "[data-ph-text]", start: "top 90%" },
          }
        );

        /* Image: mask opens upward, then drifts slightly */
        gsap.fromTo(
          "[data-ph-mask]",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.3,
            ease: "power4.inOut",
            scrollTrigger: { trigger: "[data-ph-mask]", start: "top 88%" },
          }
        );
        gsap.fromTo(
          "[data-ph-photo]",
          { scale: 1.2, yPercent: -3 },
          {
            scale: 1.05,
            yPercent: 3,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-ph-mask]",
              start: "top 90%",
              end: "bottom 20%",
              scrub: true,
            },
          }
        );

        /* Quote: the mark pops in, the lines rise from their masks, then the credit */
        gsap.fromTo(
          "[data-ph-quote-mark]",
          { autoAlpha: 0, scale: 0.4, rotate: -14, transformOrigin: "0% 100%" },
          {
            autoAlpha: 1,
            scale: 1,
            rotate: 0,
            duration: 1,
            ease: "back.out(1.7)",
            scrollTrigger: { trigger: "[data-ph-quote]", start: "top 85%" },
          }
        );
        gsap.fromTo(
          "[data-ph-quote-line]",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.16,
            delay: 0.15,
            scrollTrigger: { trigger: "[data-ph-quote]", start: "top 85%" },
          }
        );
        gsap.fromTo(
          "[data-ph-quote-by]",
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.6,
            scrollTrigger: { trigger: "[data-ph-quote]", start: "top 85%" },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      aria-labelledby="philosophy-heading"
      className="relative overflow-hidden bg-paper-deep py-16 text-ink md:py-24"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Header: pill and a one-line headline */}
        <header>
          <span
            data-ph-pill
            className="inline-block rounded-full bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-bone"
          >
            {philosophy.eyebrow}
          </span>

          <h2
            id="philosophy-heading"
            data-ph-heading
            className="mt-5 flex flex-wrap items-baseline gap-x-[0.28em] text-[clamp(1.9rem,5.2vw,4.5rem)] leading-none md:flex-nowrap"
          >
            {philosophy.headline.map((phrase, i) => (
              <span
                key={phrase}
                className="block overflow-hidden whitespace-nowrap py-[0.08em]"
              >
                <span
                  data-ph-word
                  className={cn("block", i === 1 && "text-accent")}
                >
                  {phrase}
                </span>
              </span>
            ))}
          </h2>
        </header>

        {/* Text and image: equal height on desktop, text on top, quote on the bottom edge */}
        <div className="mt-10 grid gap-10 md:mt-14 lg:grid-cols-12 lg:items-stretch lg:gap-14">
          <div className="flex flex-col lg:col-span-6 lg:justify-between">
            <div>
              <p
                data-ph-text
                className="max-w-xl text-2xl font-medium leading-snug md:text-[1.75rem]"
              >
                {philosophy.lead}
              </p>
              <p
                data-ph-text
                className="mt-6 max-w-xl text-lg leading-relaxed text-ink/75 md:text-xl"
              >
                {philosophy.statement}
              </p>
              <p
                data-ph-text
                className="mt-4 max-w-xl text-lg leading-relaxed text-ink/75 md:text-xl"
              >
                {philosophy.coaching}
              </p>
            </div>

            {/* The goal, as a quotation anchored to the bottom edge */}
            <figure data-ph-quote className="group relative mt-12 lg:mt-0 lg:pt-12">
              <span
                aria-hidden="true"
                className="inline-block origin-bottom-left text-accent transition-transform duration-500 ease-out group-hover:-rotate-6"
              >
                <svg
                  data-ph-quote-mark
                  viewBox="0 0 48 36"
                  className="block h-9 w-12 fill-current md:h-12 md:w-16"
                >
                  <path d="M0 36V21.6C0 9.6 7.2 2.4 19.2 0l2.4 4.8C14.4 7.2 11.6 11.2 11.2 16.8H21.6V36H0Zm26.4 0V21.6C26.4 9.6 33.6 2.4 45.6 0l2.4 4.8C40.8 7.2 38 11.2 37.6 16.8H48V36H26.4Z" />
                </svg>
              </span>

              <blockquote className="mt-5 font-display text-[7vw] font-extrabold uppercase leading-[0.95] sm:text-[clamp(2rem,5vw,3rem)] lg:text-[clamp(2rem,3.5vw,3.25rem)]">
                <span className="block overflow-hidden whitespace-nowrap py-[0.06em]">
                  <span data-ph-quote-line className="block">
                    {philosophy.goal.lines[0]}
                  </span>
                </span>
                {/* The red line nudges right on hover */}
                <span className="block overflow-hidden whitespace-nowrap py-[0.06em] text-accent transition-transform duration-500 ease-out group-hover:translate-x-3">
                  <span data-ph-quote-line className="block">
                    {philosophy.goal.lines[1]}
                  </span>
                </span>
              </blockquote>

              <figcaption
                data-ph-quote-by
                className="mt-5 text-sm font-medium uppercase tracking-[0.22em] text-ink/60"
              >
                The Hooker Lab
              </figcaption>
            </figure>
          </div>

          {/* Image fills the full height of the text column on desktop */}
          <div className="lg:col-span-6 lg:flex">
            <div
              data-ph-mask
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-ink sm:aspect-[4/3] lg:aspect-auto lg:min-h-[32rem]"
            >
              <div data-ph-photo className="absolute inset-0">
                <Image
                  src={philosophy.image.src}
                  alt={philosophy.image.alt}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  quality={85}
                  className={cn(
                    "object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105",
                    philosophy.image.positionClass
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
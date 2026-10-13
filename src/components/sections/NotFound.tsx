"use client";

import { useRef } from "react";
import Link from "next/link";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/nav";
import { notFound as copy } from "@/data/not-found";

const fillClass =
  "absolute inset-0 translate-y-full rounded-full bg-bone transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0";

const primaryClass =
  "group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-accent px-9 py-4 text-base font-semibold text-bone transition-colors duration-500 hover:text-ink focus-visible:text-ink focus-visible:outline-none sm:w-auto";

const secondaryClass =
  "group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full border border-bone/40 px-9 py-4 text-base font-semibold text-bone transition-colors duration-500 hover:border-bone hover:text-ink focus-visible:text-ink focus-visible:outline-none sm:w-auto";

const digits = ["4", "0", "4"];

export default function NotFound() {
  const sectionRef = useRef<HTMLElement>(null);
  const bigRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-nf-show]", { autoAlpha: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(["[data-nf-show]"], { autoAlpha: 1 });

        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .fromTo(
            "[data-nf-digit]",
            { yPercent: 110 },
            { yPercent: 0, duration: 1.4, stagger: 0.12 },
            0
          )
          .fromTo(
            "[data-nf-pill]",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.8 },
            0.5
          )
          .fromTo(
            "[data-nf-line]",
            { yPercent: 115 },
            { yPercent: 0, duration: 1.1, stagger: 0.14 },
            0.7
          )
          .fromTo(
            "[data-nf-fade]",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 },
            1.1
          );
      });

      mm.add(
        "(min-width: 1024px) and (hover: hover) and (prefers-reduced-motion: no-preference)",
        () => {
          const xTo = gsap.quickTo(bigRef.current, "x", {
            duration: 1.4,
            ease: "power3.out",
          });
          const yTo = gsap.quickTo(bigRef.current, "y", {
            duration: 1.4,
            ease: "power3.out",
          });

          const onMove = (e: MouseEvent) => {
            xTo((e.clientX / window.innerWidth - 0.5) * -30);
            yTo((e.clientY / window.innerHeight - 0.5) * -20);
          };

          window.addEventListener("mousemove", onMove);
          return () => window.removeEventListener("mousemove", onMove);
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="nf-heading"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-ink px-5 pb-16 pt-32 text-bone md:px-10"
    >
    
      <div
        ref={bigRef}
        aria-hidden="true"
        data-nf-show
        className="pointer-events-none invisible absolute inset-x-0 top-1/2 -translate-y-1/2 select-none"
      >
        <div className="flex justify-center font-display text-[clamp(13rem,42vw,38rem)] font-extrabold leading-[0.9] text-transparent opacity-10 [-webkit-text-stroke:2px_var(--color-bone)]">
          {digits.map((digit, i) => (
            <span key={i} className="block overflow-hidden px-[0.02em]">
              <span data-nf-digit className="block">
                {digit}
              </span>
            </span>
          ))}
        </div>
      </div>

      
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <span
          data-nf-pill
          data-nf-show
          className="invisible inline-block rounded-full bg-bone px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-ink"
        >
          {copy.eyebrow}
        </span>

        <h1
          id="nf-heading"
          data-nf-show
          className="invisible mt-7 text-[clamp(2.75rem,8vw,6rem)] leading-[0.92]"
        >
          {copy.headline.map((line, i) => (
            <span key={line} className="block overflow-hidden py-[0.05em]">
              <span
                data-nf-line
                className={cn("block", i === 1 && "text-accent")}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          data-nf-fade
          data-nf-show
          className="invisible mt-6 max-w-xl text-lg font-medium leading-relaxed text-bone/80 md:text-xl"
        >
          {copy.text}
        </p>

        <div
          data-nf-fade
          data-nf-show
          className="invisible mt-9 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
        >
          <Link href={copy.primary.href} className={primaryClass}>
            <span aria-hidden="true" className={fillClass} />
            <span className="relative">{copy.primary.label}</span>
          </Link>
          <Link href={copy.secondary.href} className={secondaryClass}>
            <span aria-hidden="true" className={fillClass} />
            <span className="relative">{copy.secondary.label}</span>
          </Link>
        </div>

        <nav
          data-nf-fade
          data-nf-show
          aria-label={copy.linksLabel}
          className="invisible mt-12 flex flex-col items-center gap-4"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-bone/60">
            {copy.linksLabel}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {navLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-base font-semibold text-bone/80 underline-offset-4 transition-colors duration-300 hover:text-bone hover:underline focus-visible:text-bone focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
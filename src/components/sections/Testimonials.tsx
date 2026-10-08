"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { testimonials } from "@/data/testimonials";

const { items } = testimonials;

/* Duplicate once for a seamless loop. */
const track = [...items, ...items];

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const manualRef = useRef<gsap.core.Tween | null>(null);

  const CARD_STEP = 24 * 16 + 24; // fallback: 24rem card + 1.5rem gap

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-t-header] > *",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: "[data-t-header]", start: "top 88%" },
          }
        );

        const el = trackRef.current;
        if (!el) return;

        const firstCard = el.querySelector("li");
        const step = firstCard
          ? firstCard.getBoundingClientRect().width + 24
          : CARD_STEP;

        /* Master loop — slower now (160s per full cycle) */
        const loop = gsap.to(el, {
          xPercent: -50,
          duration: 160,
          ease: "none",
          repeat: -1,
        });
        tweenRef.current = loop;

        const slow = () => loop.timeScale(0.2);
        const resume = () => loop.timeScale(1);

        el.addEventListener("pointerenter", slow);
        el.addEventListener("pointerleave", resume);
        el.addEventListener("focusin", slow);
        el.addEventListener("focusout", resume);

        (el as HTMLElement).dataset.step = String(step);

        return () => {
          el.removeEventListener("pointerenter", slow);
          el.removeEventListener("pointerleave", resume);
          el.removeEventListener("focusin", slow);
          el.removeEventListener("focusout", resume);
          loop.kill();
        };
      });
    },
    { scope: sectionRef }
  );

  const nudge = (dir: 1 | -1) => {
    const el = trackRef.current;
    const loop = tweenRef.current;
    if (!el || !loop) return;

    manualRef.current?.kill();

    const step = Number((el as HTMLElement).dataset.step ?? CARD_STEP);
    const currentX = gsap.getProperty(el, "x") as number;
    const targetX = currentX - dir * step;

    loop.pause();

    manualRef.current = gsap.to(el, {
      x: targetX,
      duration: 0.6,
      ease: "power3.out",
      onComplete: () => {
        loop.resume();
      },
    });
  };

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="relative overflow-hidden bg-white py-16 text-ink md:py-24"
    >
      <div className="mx-auto w-full max-w-350 px-5 md:px-10">
        <div data-t-header className="flex flex-col items-start gap-3">
          <span className="inline-block rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-bone">
            {testimonials.eyebrow}
          </span>
          <h2
            id="testimonials-heading"
            className="text-[clamp(2.5rem,7vw,5rem)] leading-none"
          >
            {testimonials.headline.plain}{" "}
            <span className="text-accent">
              {testimonials.headline.accent}
            </span>
          </h2>
        </div>
      </div>

      {/* Marquee wrapper — arrows float inside this, at each end */}
      <div className="relative mt-10 md:mt-14">
        {/* Edge fades */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-linear-to-r from-white to-transparent md:w-40"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-linear-to-l from-white to-transparent md:w-40"
        />

        {/* Left arrow — vertically centred on the cards */}
        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => nudge(-1)}
          className="absolute left-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-white/95 text-ink shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-sm transition duration-200 hover:border-ink hover:bg-ink hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:left-6"
        >
          <ArrowLeft size={18} weight="bold" />
        </button>

        {/* Right arrow — vertically centred on the cards */}
        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => nudge(1)}
          className="absolute right-3 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-white/95 text-ink shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-sm transition duration-200 hover:border-ink hover:bg-ink hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:right-6"
        >
          <ArrowRight size={18} weight="bold" />
        </button>

        <ul
          ref={trackRef}
          className="flex w-max gap-5 will-change-transform md:gap-6"
          style={{ paddingLeft: "1.25rem", paddingRight: "1.25rem" }}
        >
          {track.map((t, i) => (
            <li
              key={`${t.id}-${i}`}
              aria-hidden={i >= items.length}
              className="w-[20rem] shrink-0 md:w-[24rem]"
            >
              <figure
                tabIndex={0}
                className={cn(
                  "group/card relative flex h-full flex-col overflow-hidden rounded-3xl border border-ink/10 bg-paper transition duration-300",
                  "hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_28px_70px_-32px_rgba(0,0,0,0.25)]",
                  "focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                )}
              >
                {/* Photo banner */}
                <div className="relative aspect-[5/4] overflow-hidden bg-ink">
                  <Image
                    src={t.image}
                    alt={`${t.name}, ${t.role} at ${t.org}`}
                    fill
                    sizes="(min-width: 768px) 24rem, 20rem"
                    className={cn(
                      "object-cover transition duration-700",
                      "grayscale-[35%] group-hover/card:scale-[1.03] group-hover/card:grayscale-0"
                    )}
                    unoptimized
                  />
                </div>

                {/* Quote block */}
                <div className="flex flex-1 flex-col p-6 pt-2 md:p-7 md:pt-3">
                  <span
                    aria-hidden="true"
                    className="font-display text-5xl leading-none text-accent md:text-6xl"
                  >
                    &ldquo;
                  </span>

                  <blockquote className="-mt-2 flex-1 md:-mt-3">
                    <p className="text-base font-medium leading-snug text-ink/90 md:text-lg">
                      {t.quote}
                    </p>
                  </blockquote>

                  <div className="mt-6 border-t border-ink/10 pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink/55 md:text-[11px]">
                      {t.role} · {t.org}
                    </p>
                    <p className="mt-1.5 font-display text-2xl font-extrabold uppercase leading-none tracking-tight text-ink md:text-[1.75rem]">
                      {t.name}
                    </p>
                  </div>
                </div>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
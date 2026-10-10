"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { testimonials } from "@/data/testimonials";

const { items } = testimonials;

type Testimonial = (typeof items)[number];

/* With this many testimonials or fewer, desktop shows them all at once */
const MAX_STATIC = 5;
const showStatic = items.length <= MAX_STATIC;

/* Quote is clipped to this many lines (5 lines x 1.375rem). If you change it,
   update COLLAPSED_REM and both arbitrary classes in the quote box below. */
const COLLAPSED_REM = 6.875;

/* Duplicate once for a seamless loop (marquee only) */
const track = [...items, ...items];

const MARQUEE_QUERY = showStatic
  ? "(prefers-reduced-motion: no-preference) and (max-width: 1279px)"
  : "(prefers-reduced-motion: no-preference)";

function TestimonialCard({
  t,
  decorative,
  onExpandChange,
}: {
  t: Testimonial;
  decorative?: boolean;
  onExpandChange?: (open: boolean) => void;
}) {
  const quoteId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const expandedRef = useRef(false);
  const animatingRef = useRef(false);

  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  /* Show "View more" only when the quote is longer than the collapsed height */
  useEffect(() => {
    const p = textRef.current;
    const box = boxRef.current;
    if (!p || !box) return;

    const measure = () => {
      if (expandedRef.current || animatingRef.current) return;
      setOverflowing(p.offsetHeight > box.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(p);

    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const box = boxRef.current;
    const p = textRef.current;
    if (!box || !p) return;

    const next = !expanded;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const collapsedPx =
      parseFloat(getComputedStyle(document.documentElement).fontSize) *
      COLLAPSED_REM;

    expandedRef.current = next;
    animatingRef.current = true;
    setExpanded(next);
    onExpandChange?.(next);

    gsap.killTweensOf(box);

    if (next) {
      gsap.fromTo(
        box,
        { maxHeight: box.clientHeight },
        {
          maxHeight: p.offsetHeight,
          duration: reduceMotion ? 0 : 0.55,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(box, { maxHeight: "none" });
            animatingRef.current = false;
          },
        }
      );
    } else {
      gsap.fromTo(
        box,
        { maxHeight: box.offsetHeight },
        {
          maxHeight: collapsedPx,
          duration: reduceMotion ? 0 : 0.45,
          ease: "power3.inOut",
          onComplete: () => {
            gsap.set(box, { clearProps: "maxHeight" });
            animatingRef.current = false;
          },
        }
      );
    }
  };

  return (
    <figure
      tabIndex={decorative ? -1 : 0}
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-2xl border bg-paper transition duration-300",
        expanded ? "border-ink/30" : "border-ink/10",
        "hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.25)]",
        "focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      )}
    >
      {/* Photo banner */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
        <Image
          src={t.image}
          alt={`${t.name}, ${t.role} at ${t.org}`}
          fill
          sizes="(min-width: 1280px) 20vw, 18rem"
          className={cn(
            "object-cover transition duration-700",
            "grayscale-[35%] group-hover/card:scale-[1.03] group-hover/card:grayscale-0"
          )}
          unoptimized
        />
      </div>

      {/* Quote block */}
      <div className="flex flex-col p-4 pt-1 md:p-5 md:pt-2">
        <span
          aria-hidden="true"
          className="font-display text-4xl leading-none text-accent"
        >
          &ldquo;
        </span>

        <blockquote id={quoteId} className="-mt-1">
          <div
            ref={boxRef}
            className={cn(
              "min-h-[6.875rem] max-h-[6.875rem] overflow-hidden",
              !expanded &&
                overflowing &&
                "[-webkit-mask-image:linear-gradient(to_bottom,black_60%,transparent)] [mask-image:linear-gradient(to_bottom,black_60%,transparent)]"
            )}
          >
            <p
              ref={textRef}
              className="text-base font-medium leading-snug text-ink/90"
            >
              {t.quote}
            </p>
          </div>
        </blockquote>

        {/* Always takes up its space so collapsed cards stay the same height */}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={quoteId}
          aria-hidden={overflowing ? undefined : true}
          tabIndex={decorative || !overflowing ? -1 : 0}
          className={cn(
            "mt-2 w-fit text-sm font-semibold underline-offset-4 transition-colors duration-300 hover:text-accent hover:underline focus-visible:text-accent focus-visible:outline-none",
            !overflowing && "invisible"
          )}
        >
          {expanded ? "View less" : "View more"}
        </button>

        <div className="mt-3 border-t border-ink/10 pt-3">
          <p className="min-h-7 text-[10px] font-semibold uppercase leading-snug tracking-[0.22em] text-ink/55">
            {t.role} · {t.org}
          </p>
          <p className="mt-1.5 font-display text-xl font-extrabold uppercase leading-none tracking-tight text-ink md:text-2xl">
            {t.name}
          </p>
        </div>
      </div>
    </figure>
  );
}

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const manualRef = useRef<gsap.core.Tween | null>(null);
  const openRef = useRef(0);

  const CARD_STEP = 17 * 16 + 16; // fallback: 17rem card + 1rem gap

  /* The sliding row pauses while any card is expanded */
  const handleExpandChange = (open: boolean) => {
    openRef.current = Math.max(0, openRef.current + (open ? 1 : -1));

    const loop = tweenRef.current;
    if (!loop) return;

    if (openRef.current > 0) loop.pause();
    else loop.resume();
  };

  /* Header and card reveal */
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

        gsap.fromTo(
          "[data-t-card]",
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: "[data-t-track]", start: "top 92%" },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  /* Marquee loop (not used on desktop when every testimonial fits at once) */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MARQUEE_QUERY, () => {
        const el = trackRef.current;
        if (!el) return;

        const firstCard = el.querySelector("li");
        const gap = parseFloat(getComputedStyle(el).columnGap) || 16;
        const step = firstCard
          ? firstCard.getBoundingClientRect().width + gap
          : CARD_STEP;

        /* Master loop: 160s per full cycle */
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

        el.dataset.step = String(step);

        return () => {
          el.removeEventListener("pointerenter", slow);
          el.removeEventListener("pointerleave", resume);
          el.removeEventListener("focusin", slow);
          el.removeEventListener("focusout", resume);
          loop.kill();
          tweenRef.current = null;
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

    const step = Number(el.dataset.step ?? CARD_STEP);
    const currentX = gsap.getProperty(el, "x") as number;
    const targetX = currentX - dir * step;

    loop.pause();

    manualRef.current = gsap.to(el, {
      x: targetX,
      duration: 0.6,
      ease: "power3.out",
      onComplete: () => {
        if (openRef.current === 0) loop.resume();
      },
    });
  };

  const arrowClass =
    "absolute top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-ink/15 bg-white/95 text-ink shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-sm transition duration-200 hover:border-ink hover:bg-ink hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
            <span className="text-accent">{testimonials.headline.accent}</span>
          </h2>
        </div>
      </div>

      {/* Marquee on small screens (and on desktop with more than five), a static row otherwise */}
      <div data-t-track className="relative mt-10 md:mt-14">
        {/* Edge fades */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-linear-to-r from-white to-transparent md:w-32",
            showStatic && "xl:hidden"
          )}
        />
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-linear-to-l from-white to-transparent md:w-32",
            showStatic && "xl:hidden"
          )}
        />

        <button
          type="button"
          aria-label="Previous testimonial"
          onClick={() => nudge(-1)}
          className={cn(
            arrowClass,
            "left-3 md:left-6",
            showStatic && "xl:hidden"
          )}
        >
          <ArrowLeft size={18} weight="bold" />
        </button>

        <button
          type="button"
          aria-label="Next testimonial"
          onClick={() => nudge(1)}
          className={cn(
            arrowClass,
            "right-3 md:right-6",
            showStatic && "xl:hidden"
          )}
        >
          <ArrowRight size={18} weight="bold" />
        </button>

        <ul
          ref={trackRef}
          className={cn(
            "flex w-max items-start gap-4 px-5 will-change-transform",
            showStatic &&
              "xl:mx-auto xl:w-full xl:max-w-350 xl:justify-center xl:px-10"
          )}
        >
          {track.map((t, i) => {
            const duplicate = i >= items.length;

            return (
              <li
                key={`${t.id}-${i}`}
                aria-hidden={duplicate}
                data-t-card={duplicate ? undefined : ""}
                className={cn(
                  "w-[17rem] shrink-0 md:w-[18rem]",
                  showStatic
                    ? "xl:w-[calc((100%_-_4rem)_/_5)]"
                    : "xl:w-[calc((min(100vw,87.5rem)_-_9rem)_/_5)]",
                  showStatic && duplicate && "xl:hidden"
                )}
              >
                <TestimonialCard
                  t={t}
                  decorative={duplicate}
                  onExpandChange={handleExpandChange}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
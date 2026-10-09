"use client";

import { useRef } from "react";
import Image from "next/image";
import { Trophy } from "@phosphor-icons/react";

import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { about } from "@/data/about";

const headlineStyles = [
  "text-ink",
  "text-accent",
  "text-ink",
];

const tierStyles = {
  featured: {
    base: "col-span-2 bg-ink text-bone",
    name: "text-xl md:text-2xl",
    meta: "text-bone/80",
  },
  plain: {
    base: "border border-ink/15 bg-white text-ink",
    name: "text-base md:text-lg",
    meta: "text-ink/70",
  },
} as const;

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Portrait: mask opens upward, photo settles and drifts */
        gsap.fromTo(
          "[data-about-mask]",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.3,
            ease: "power4.inOut",
            scrollTrigger: { trigger: "[data-about-mask]", start: "top 82%" },
          }
        );
        gsap.fromTo(
          "[data-about-photo]",
          { scale: 1.3, yPercent: -4 },
          {
            scale: 1.04,
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-about-mask]",
              start: "top 90%",
              end: "bottom 20%",
              scrub: true,
            },
          }
        );

        /* Eyebrow pill */
        gsap.fromTo(
          "[data-about-pill]",
          { autoAlpha: 0, x: -20 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-about-pill]", start: "top 90%" },
          }
        );

        /* Headline words rise out of masks */
        gsap.fromTo(
          "[data-about-word]",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.14,
            scrollTrigger: { trigger: "[data-about-heading]", start: "top 88%" },
          }
        );

        /* Statement lights up word by word */
        if (statementRef.current) {
          const split = SplitText.create(statementRef.current, {
            type: "words",
          });
          gsap.fromTo(
            split.words,
            { opacity: 0.35 },
            {
              opacity: 1,
              ease: "none",
              stagger: 0.05,
              scrollTrigger: {
                trigger: statementRef.current,
                start: "top 88%",
                end: "bottom 62%",
                scrub: true,
              },
            }
          );
        }
        gsap.fromTo(
          "[data-about-closing]",
          { autoAlpha: 0, y: 16 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-about-closing]", start: "top 92%" },
          }
        );

        /* Stats: cards rise, numbers count */
        gsap.fromTo(
          "[data-about-stat]",
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: "[data-about-stats]", start: "top 88%" },
          }
        );
        gsap.utils.toArray<HTMLElement>("[data-about-count]").forEach((el) => {
          const target = Number(el.dataset.aboutCount);
          gsap.fromTo(
            el,
            { textContent: 0 },
            {
              textContent: target,
              duration: 1.6,
              ease: "power2.out",
              snap: { textContent: 1 },
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            }
          );
        });

        /* Represented tiles: wipe up one after another */
        gsap.fromTo(
          "[data-about-tile]",
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 0.9,
            ease: "power4.out",
            stagger: 0.08,
            scrollTrigger: { trigger: "[data-about-tiles]", start: "top 90%" },
          }
        );

        /* Honours */
        gsap.fromTo(
          "[data-about-honour]",
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: "[data-about-honours]", start: "top 94%" },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
   <section
  ref={sectionRef}
  id="coach"
  aria-labelledby="about-heading"
  className="relative overflow-hidden bg-paper py-16 text-ink md:py-24"
>
      <div className="mx-auto grid max-w-350 gap-10 px-5 md:px-10 lg:grid-cols-12 lg:gap-14">
        {/* Portrait */}
        <div className="lg:col-span-5">
          <div
            data-about-mask
            className="relative aspect-4/5 w-full overflow-hidden bg-ink lg:aspect-auto lg:h-full lg:min-h-135"
          >
            <div data-about-photo className="absolute inset-0">
              <Image
                src={about.image.src}
                alt={about.image.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                quality={85}
                className={cn("object-cover", about.image.positionClass)}
              />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-ink/80 via-transparent to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-bone md:p-6">
              <span className="font-display text-2xl md:text-3xl">
                {about.caption.name}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-bone">
                {about.caption.detail}
              </span>
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="flex flex-col lg:col-span-7">
          <span
            data-about-pill
            className="w-fit rounded-full bg-ink px-4 py-1.5 text-xs font-medium uppercase tracking-[0.28em] text-bone"
          >
            {about.eyebrow}
          </span>

          {/* One-line headline: the only coloured element */}
          <h2
            id="about-heading"
            data-about-heading
            className="mt-6 flex items-baseline gap-[0.28em] whitespace-nowrap text-[clamp(1.1rem,4.8vw,2.6rem)] leading-none lg:text-[clamp(1.75rem,2.9vw,2.6rem)]"
          >
            {about.headline.map((word, i) => (
              <span key={word} className="block overflow-hidden py-[0.08em]">
                <span
                  data-about-word
                  className={cn("block", headlineStyles[i])}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>

          <p
            ref={statementRef}
            className="mt-6 max-w-2xl text-xl font-medium leading-snug text-ink md:text-2xl"
          >
            {about.statement}
          </p>
          <p
            data-about-closing
            className="mt-4 max-w-2xl text-lg font-medium leading-relaxed text-ink/75 md:text-xl"
          >
            {about.closing}
          </p>

          {/* Stats */}
          <dl data-about-stats className="mt-7 grid grid-cols-3 gap-3 md:gap-4">
            {about.stats.map(({ value, suffix, label }) => (
              <div key={label} data-about-stat className="flex">
                <div className="flex w-full flex-col-reverse justify-end bg-ink px-4 py-5 text-bone md:px-6 md:py-7">
                  <dt className="mt-2 text-[11px] font-semibold uppercase leading-snug tracking-[0.16em] text-bone/85 md:text-sm">
                    {label}
                  </dt>
                  <dd className="font-display text-5xl md:text-6xl">
                    <span data-about-count={value}>{value}</span>
                    {suffix}
                  </dd>
                </div>
              </div>
            ))}
          </dl>

          {/* Represented */}
          <div className="mt-7">
            <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-ink/80">
              {about.representedTitle}
            </h3>
            <ul
              data-about-tiles
              className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-3 lg:grid-cols-4"
            >
              {about.represented.map(({ team, note, tier, logo }, i) => {
                const style = tierStyles[tier];
                const isFeatured = tier === "featured";

                return (
                  <li
                    key={team}
                    data-about-tile
                    className={cn("flex", isFeatured && "col-span-2")}
                  >
                    <div
                      className={cn(
                        "flex min-h-28 w-full flex-col justify-between gap-3 p-3.5 md:min-h-32 md:p-4",
                        style.base
                      )}
                    >
                      {/* Top row: number + note */}
                      <span
                        className={cn(
                          "flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em]",
                          style.meta
                        )}
                      >
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {note && <span>{note}</span>}
                      </span>

                      {/* Bottom: logo + team name */}
                      <div
                        className={cn(
                          "flex items-center gap-3",
                          isFeatured
                            ? "flex-row"
                            : "flex-col items-start gap-2"
                        )}
                      >
                        {logo && (
                          <div
                            className={cn(
                              "relative shrink-0",
                              isFeatured
                                ? "h-12 w-12 md:h-14 md:w-14"
                                : "h-10 w-10 md:h-11 md:w-11"
                            )}
                          >
                            <Image
                              src={logo}
                              alt=""
                              fill
                              sizes="(min-width: 768px) 56px, 48px"
                              className={cn(
                                "object-contain",
                                isFeatured && "brightness-0 invert"
                              )}
                            />
                          </div>
                        )}
                        <span
                          className={cn(
                            "font-display leading-[1.05]",
                            style.name
                          )}
                        >
                          {team}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Honours */}
          <ul data-about-honours className="mt-5 flex flex-wrap gap-2.5">
            {about.honours.map((honour) => (
              <li
                key={honour}
                data-about-honour
                className="flex items-center gap-2.5 rounded-full border border-ink/25 bg-white px-5 py-2.5 text-base font-semibold text-ink"
              >
                <Trophy size={20} weight="duotone" className="text-ink" />
                {honour}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
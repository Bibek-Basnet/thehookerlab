"use client";

import { useRef, useState } from "react";
import { Plus } from "@phosphor-icons/react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { faq } from "@/data/faq";

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [openIndex, setOpenIndex] = useState(0);

  /* Entrance animations */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-faq-pill]",
          { autoAlpha: 0, y: -10 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-faq-pill]", start: "top 90%" },
          }
        );

        gsap.fromTo(
          "[data-faq-word]",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.14,
            scrollTrigger: { trigger: "[data-faq-heading]", start: "top 88%" },
          }
        );

        gsap.fromTo(
          "[data-faq-intro]",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-faq-intro]", start: "top 90%" },
          }
        );

        gsap.fromTo(
          "[data-faq-item]",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: "[data-faq-list]", start: "top 88%" },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  /* Accordion: GSAP drives the height and the answer reveal */
  const animatePanel = (index: number, open: boolean) => {
    const panel = panelRefs.current[index];
    if (!panel) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    gsap.killTweensOf(panel);

    if (open) {
      gsap.to(panel, {
        height: "auto",
        autoAlpha: 1,
        duration: reduce ? 0 : 0.5,
        ease: "power3.out",
        onComplete: () => ScrollTrigger.refresh(),
      });

      const answer = panel.querySelector("[data-faq-answer]");
      if (answer && !reduce) {
        gsap.fromTo(
          answer,
          { y: 10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, delay: 0.08, ease: "power3.out" }
        );
      }
    } else {
      gsap.to(panel, {
        height: 0,
        autoAlpha: 0,
        duration: reduce ? 0 : 0.35,
        ease: "power3.inOut",
        onComplete: () => ScrollTrigger.refresh(),
      });
    }
  };

  const toggle = (index: number) => {
    const willOpen = openIndex !== index;

    if (openIndex !== -1 && openIndex !== index) animatePanel(openIndex, false);
    animatePanel(index, willOpen);
    setOpenIndex(willOpen ? index : -1);
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      aria-labelledby="faq-heading"
      className="relative bg-paper py-16 text-ink md:py-24"
    >
      <div className="mx-auto w-full max-w-4xl px-5 md:px-10">
        {/* Header */}
        <div>
          <span
            data-faq-pill
            className="inline-block rounded-full bg-ink px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-bone"
          >
            {faq.eyebrow}
          </span>

          <h2
            id="faq-heading"
            data-faq-heading
            className="mt-6 flex flex-wrap items-baseline gap-x-[0.28em] text-[clamp(2.25rem,6vw,4.25rem)] leading-none"
          >
            {faq.headline.map((word, i) => (
              <span key={word} className="inline-block overflow-hidden py-[0.08em]">
                <span
                  data-faq-word
                  className={cn("block", i === 1 && "text-accent")}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>

          {faq.intro && (
            <p
              data-faq-intro
              className="mt-6 text-lg leading-relaxed text-ink/75 md:text-xl"
            >
              {faq.intro}{" "}
              <a
                href={faq.cta.href}
                className="font-semibold text-ink underline decoration-ink/30 decoration-2 underline-offset-4 transition-colors duration-200 hover:text-accent hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {faq.cta.label}
              </a>
            </p>
          )}
        </div>

        {/* Accordion */}
        <ul data-faq-list className="mt-14 md:mt-16">
          {faq.items.map((item, i) => {
            const open = openIndex === i;
            const buttonId = `faq-btn-${item.id}`;
            const panelId = `faq-panel-${item.id}`;

            return (
              <li
                key={item.id}
                data-faq-item
                className="border-b border-ink/15 first:border-t"
              >
                <div data-open={open} className="group">
                  <h3 className="m-0">
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => toggle(i)}
                      className="relative flex w-full items-center gap-6 py-7 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ink md:gap-10 md:py-9"
                    >
                      <span className="flex-1 font-display text-xl font-extrabold uppercase leading-tight tracking-tight text-ink transition-transform duration-300 group-hover:translate-x-1 md:text-[1.625rem]">
                        {item.question}
                      </span>

                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-ink/20 text-ink transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-bone group-data-[open=true]:border-ink group-data-[open=true]:bg-ink group-data-[open=true]:text-bone md:size-12">
                        <Plus
                          size={18}
                          weight="bold"
                          className="transition-transform duration-500 group-data-[open=true]:rotate-45"
                        />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    ref={(el) => {
                      panelRefs.current[i] = el;
                    }}
                    role="region"
                    aria-labelledby={buttonId}
                    className={cn(
                      "overflow-hidden",
                      i !== 0 && "invisible h-0"
                    )}
                  >
                    <div data-faq-answer className="pb-9 md:pb-12">
                      <p className="text-xl leading-relaxed text-ink md:text-2xl md:leading-[1.5]">
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
  );
}
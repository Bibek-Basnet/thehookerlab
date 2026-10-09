"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check } from "@phosphor-icons/react";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { online } from "@/data/online";
import RegistrationDialog from "@/components/ui/RegistrationDialog";

const cardSpring = { type: "spring", stiffness: 320, damping: 24 } as const;

function RegisterNow() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div data-op-fade className="mt-7">
        <motion.div
          initial="rest"
          animate="rest"
          whileHover="hover"
          variants={{ rest: { y: 0 }, hover: { y: -2 } }}
          transition={cardSpring}
          className="inline-block"
        >
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-4 rounded-full bg-ink px-8 py-3.5 text-base font-semibold text-bone shadow-[0_0_0_0_rgba(0,0,0,0)] transition-all duration-300 hover:shadow-[0_14px_30px_-14px_rgba(0,0,0,0.55)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            {online.cta.label}
            <motion.span
              variants={{ rest: { x: 0 }, hover: { x: 5 } }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex"
            >
              <ArrowRight size={18} weight="bold" />
            </motion.span>
          </button>
        </motion.div>
      </div>

      <RegistrationDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function OnlineProgramme() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-op-pill]",
          { autoAlpha: 0, x: -20 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-op-pill]", start: "top 90%" },
          }
        );
        gsap.fromTo(
          "[data-op-word]",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.14,
            scrollTrigger: { trigger: "[data-op-heading]", start: "top 88%" },
          }
        );
        gsap.fromTo(
          "[data-op-fade]",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: "[data-op-left]", start: "top 85%" },
          }
        );
        gsap.fromTo(
          "[data-op-glance]",
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-op-glance]", start: "top 92%" },
          }
        );
        gsap.fromTo(
          "[data-op-card]",
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: { trigger: "[data-op-inside]", start: "top 90%" },
          }
        );
        gsap.fromTo(
          "[data-op-benefit]",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: "[data-op-benefits]", start: "top 92%" },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="online"
      aria-labelledby="online-heading"
      className="relative border-t border-ink/10 bg-white py-16 text-ink md:py-20"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Top: what it is, CTA, and at a glance */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div data-op-left className="lg:col-span-7">
            <span
              data-op-pill
              className="inline-block rounded-full bg-ink px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-bone"
            >
              {online.eyebrow}
            </span>

            <h2
              id="online-heading"
              data-op-heading
              className="mt-5 flex items-baseline gap-[0.28em] whitespace-nowrap text-[clamp(1.75rem,4.2vw,3rem)] leading-none"
            >
              {online.headline.map((word, i) => (
                <span key={word} className="block overflow-hidden py-[0.08em]">
                  <span
                    data-op-word
                    className={cn("block", i === 1 && "text-accent")}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h2>

            <p
              data-op-fade
              className="mt-6 max-w-2xl text-lg font-medium leading-snug md:text-xl"
            >
              {online.intro}
            </p>
            <p
              data-op-fade
              className="mt-3 max-w-2xl text-base leading-relaxed text-ink/75 md:text-lg"
            >
              {online.body}
            </p>

            <RegisterNow />
          </div>

          <aside
            data-op-glance
            className="rounded-2xl border border-ink/10 bg-paper p-4 md:p-5 lg:col-span-5 lg:self-start"
          >
            <h3 className="px-2 font-body text-[11px] font-semibold uppercase tracking-[0.25em] text-ink/60">
              {online.factsTitle}
            </h3>
            <dl className="mt-3">
              {online.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline justify-between gap-4 rounded-xl px-2 py-3 transition-colors duration-300 hover:bg-white"
                >
                  <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/60">
                    {fact.label}
                  </dt>
                  <dd className="text-right text-base font-semibold leading-snug">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>

        {/* What's inside */}
        <div className="mt-12 md:mt-14">
          <h3 className="text-2xl leading-none md:text-3xl">
            {online.insideTitle}
          </h3>

          <ul data-op-inside className="mt-5 grid gap-4 md:grid-cols-3">
            {online.items.map((item, i) => (
              <li key={item.id} data-op-card className="flex">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={cardSpring}
                  className="group relative w-full overflow-hidden rounded-2xl border border-ink/10 bg-paper p-5 transition-[border-color,box-shadow,background-color] duration-300 hover:border-ink/30 hover:bg-white hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 block h-0.5 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />

                  <div className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-bone transition-transform duration-300 group-hover:scale-110">
                      {i + 1}
                    </span>
                    <h4 className="font-display text-xl font-bold uppercase leading-none">
                      {item.title}
                    </h4>
                  </div>

                  <p className="mt-3 text-base leading-snug text-ink/75">
                    {item.text}
                  </p>

                  <ul className="mt-4 space-y-2">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2.5 text-sm font-medium leading-snug md:text-[0.9375rem]"
                      >
                        <Check
                          size={16}
                          weight="bold"
                          className="mt-0.5 shrink-0"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </li>
            ))}
          </ul>
        </div>

        {/* Why train online */}
        <div className="mt-10 md:mt-12">
          <h3 className="text-2xl leading-none md:text-3xl">
            {online.benefitsTitle}
          </h3>

          <ul
            data-op-benefits
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {online.benefits.map((benefit) => (
              <li key={benefit.title} data-op-benefit className="flex">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={cardSpring}
                  className="group relative w-full overflow-hidden rounded-2xl border border-ink/10 bg-paper p-4 transition-[border-color,box-shadow,background-color] duration-300 hover:border-ink/30 hover:bg-white hover:shadow-[0_24px_48px_-28px_rgba(0,0,0,0.35)] md:p-5"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 block h-0.5 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />

                  <span className="grid size-8 place-items-center rounded-full bg-ink text-bone transition-transform duration-300 group-hover:scale-110">
                    <Check size={16} weight="bold" />
                  </span>
                  <p className="mt-3 text-base font-semibold leading-snug">
                    {benefit.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-ink/70 md:text-[0.9375rem]">
                    {benefit.text}
                  </p>
                </motion.div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
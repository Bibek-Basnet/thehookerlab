"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check } from "@phosphor-icons/react";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { services } from "@/data/services";

type Service = (typeof services.items)[number];

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thehookerlab.co.nz";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "The Hooker Lab coaching services",
  itemListElement: services.items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: item.title,
      description: item.summary,
      url: `${SITE_URL}/services/${item.id}`,
      provider: { "@type": "Organization", name: "The Hooker Lab" },
    },
  })),
};

function ServiceCard({ item }: { item: Service }) {
  return (
    <motion.article
      initial="rest"
      animate="rest"
      whileHover="hover"
      variants={{ rest: { y: 0 }, hover: { y: -6 } }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-ink/10 bg-paper p-3 transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.3)]"
    >
      {/* Photo */}
      <div
        data-svc-mask
        className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-ink"
      >
        <div data-svc-img className="absolute inset-0">
          <Image
            src={item.image.src}
            alt={item.image.alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={85}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent"
        />
        {/* Sheen sweep on hover */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[300%]"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-ink">
          {item.format}
        </span>
        <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 font-display text-sm text-bone backdrop-blur-md">
          {item.number}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 pt-6 md:p-8 md:pt-8">
        <div>
          <h3
            data-svc-fade
            className="font-display text-[1.75rem] leading-[1.1] md:text-3xl"
          >
            {item.title}
          </h3>

          <p
            data-svc-fade
            className="mt-4 text-lg leading-relaxed text-ink/80 md:text-[1.1875rem]"
          >
            {item.summary}
          </p>
        </div>

        {/* Bottom group: checklist and footer, aligned across all cards */}
        <div className="mt-8 lg:mt-auto lg:pt-8">
          <h4
            data-svc-fade
            className="text-[11px] uppercase tracking-[0.28em] text-ink/60"
          >
            {item.listTitle}
          </h4>

          <ul className="mt-4 space-y-3">
            {item.points.map((point) => (
              <li
                key={point}
                data-svc-point
                className="flex items-start gap-3 text-base leading-snug text-ink/90 md:text-[1.0625rem]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink/25 transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-bone">
                  <Check size={12} weight="bold" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <div
            data-svc-fade
            className="mt-8 flex items-end justify-between gap-4 border-t border-ink/10 pt-6"
          >
            <div>
              <span className="block text-[11px] uppercase tracking-[0.25em] text-ink/60">
                From
              </span>
              <span className="mt-1 flex items-baseline gap-2">
                <span className="font-display text-4xl leading-none">
                  {item.price}
                </span>
                <span className="text-sm text-ink/60">{item.priceUnit}</span>
              </span>
            </div>

            <Link
              href={`/services/${item.id}`}
              className="inline-flex items-center gap-3 text-sm font-medium uppercase tracking-[0.18em] after:absolute after:inset-0 focus-visible:outline-none"
            >
              View more
              <span className="sr-only"> about {item.title}</span>
              <motion.span
                variants={{ rest: { x: 0 }, hover: { x: 6 } }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/25 transition-colors duration-300 group-hover:border-ink group-hover:bg-ink group-hover:text-bone"
              >
                <ArrowRight size={16} />
              </motion.span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom line draws on hover */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 block h-1 origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
    </motion.article>
  );
}

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* Header */
        gsap.fromTo(
          "[data-svc-pill]",
          { autoAlpha: 0, x: -20 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-svc-pill]", start: "top 90%" },
          }
        );
        gsap.fromTo(
          "[data-svc-word]",
          { yPercent: 115 },
          {
            yPercent: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.14,
            scrollTrigger: { trigger: "[data-svc-heading]", start: "top 88%" },
          }
        );

        /* Cards */
        const cards = gsap.utils.toArray<HTMLElement>("[data-service-card]");

        cards.forEach((card, i) => {
          const q = gsap.utils.selector(card);

          gsap
            .timeline({
              delay: (i % 2) * 0.12,
              scrollTrigger: { trigger: card, start: "top 88%" },
            })
            .fromTo(
              card,
              { autoAlpha: 0, y: 48 },
              { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" },
              0
            )
            .fromTo(
              q("[data-svc-mask]"),
              { clipPath: "inset(100% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.2,
                ease: "power4.inOut",
              },
              0.1
            )
            .fromTo(
              q("[data-svc-fade]"),
              { autoAlpha: 0, y: 16 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.7,
                ease: "power3.out",
                stagger: 0.07,
              },
              0.45
            )
            .fromTo(
              q("[data-svc-point]"),
              { autoAlpha: 0, y: 10 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.5,
                ease: "power3.out",
                stagger: 0.04,
              },
              0.65
            );

          /* Photo drifts inside its frame as you scroll */
          gsap.fromTo(
            q("[data-svc-img]"),
            { yPercent: -6, scale: 1.15 },
            {
              yPercent: 6,
              scale: 1.15,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="programmes"
      aria-labelledby="services-heading"
      className="relative bg-white py-20 text-ink md:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1400px] px-5 md:px-10">
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <span
            data-svc-pill
            className="inline-block rounded-full bg-ink px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-bone"
          >
            {services.eyebrow}
          </span>

          <h2
            id="services-heading"
            data-svc-heading
            className="mt-6 flex items-baseline gap-[0.28em] whitespace-nowrap text-[clamp(1.75rem,4.2vw,3rem)] leading-none"
          >
            {services.headline.map((word, i) => (
              <span key={word} className="block overflow-hidden py-[0.08em]">
                <span
                  data-svc-word
                  className={cn("block", i === 1 && "text-accent")}
                >
                  {word}
                </span>
              </span>
            ))}
          </h2>
        </div>

        {/* Four equal cards */}
        <ul className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {services.items.map((item) => (
            <li key={item.id} data-service-card className="flex">
              <ServiceCard item={item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
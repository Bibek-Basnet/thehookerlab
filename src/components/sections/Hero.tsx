"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { hero } from "@/data/hero";
import SocialDock from "@/components/ui/SocialDock";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (reduceMotion) {
        gsap.set(introRef.current, { opacity: 1 });
        gsap.set("[data-hero-hide]", { autoAlpha: 1 });
        return;
      }

      gsap.set(introRef.current, {
        opacity: 1,
        clipPath: `circle(0% at ${focus})`,
      });
      gsap.set(
        [headingRef.current, "[data-hero-copy]", "[data-hero-social]"],
        { autoAlpha: 1 }
      );

      /* Intro: the photo fades in and settles slowly. The headline is
         written in letter by letter, the paragraph follows word by word,
         and the icons rise in quietly. */
      gsap
        .timeline({ delay: 0.2 })
        .fromTo(
          introRef.current,
          { opacity: 0, scale: 1.1 },
          { opacity: 1, scale: 1.05, duration: 1.8, ease: "power2.out" },
          0
        )
        .fromTo(
          "[data-hero-char]",
          { yPercent: 120, rotate: 8, transformOrigin: "0% 100%" },
          {
            yPercent: 0,
            rotate: 0,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.028,
          },
          0.7
        )
        .fromTo(
          "[data-hero-body-word]",
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.018,
          },
          1.4
        )
        .fromTo(
          "[data-hero-social] li",
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: { each: 0.08, from: "end" },
          },
          1.9
        );

      /* Once settled, the photo keeps a very slow breathing push-in */
      gsap.to(mouseRef.current, {
        scale: 1.06,
        duration: 18,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 3,
      });

      /* Scroll: the photo drifts and darkens while the text lifts away */
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        })
        .to(scrollRef.current, { yPercent: 8, scale: 1.1 }, 0)
        .to(shadeRef.current, { opacity: 0.7 }, 0)
        .to(contentRef.current, { y: -50, opacity: 0 }, 0);

      /* Desktop only: soft mouse drift on the photo */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (hover: hover)", () => {
        const xTo = gsap.quickTo(mouseRef.current, "x", {
          duration: 1.4,
          ease: "power3.out",
        });
        const yTo = gsap.quickTo(mouseRef.current, "y", {
          duration: 1.4,
          ease: "power3.out",
        });

        const onMove = (e: MouseEvent) => {
          xTo((e.clientX / window.innerWidth - 0.5) * -22);
          yTo((e.clientY / window.innerHeight - 0.5) * -14);
        };

        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="home"
      aria-label="Introduction"
      className="relative h-svh min-h-[620px] overflow-hidden bg-ink"
    >
      {/* Full-bleed photo, always black and white */}
      <div ref={introRef} className="absolute inset-0 opacity-0">
        <div ref={scrollRef} className="absolute inset-0">
          <div ref={mouseRef} className="absolute inset-0">
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              fill
              priority
              quality={85}
              sizes="100vw"
              className={cn(
                "object-cover grayscale contrast-110",
                hero.image.positionClass
              )}
            />
          </div>
        </div>
      </div>

      {/* Shading: only the bottom edge, so the photo stays clear above it */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-t from-ink/95 via-ink/55 via-28% to-transparent to-58%"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-ink/60 via-ink/15 via-45% to-transparent to-70%"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink/60 to-transparent"
      />
      <div
        ref={shadeRef}
        aria-hidden="true"
        className="absolute inset-0 bg-ink opacity-0"
      />

      {/* Content: headline and paragraph as one left-aligned group.
          Socials sit in the bottom-right corner on desktop. */}
      <div
        ref={contentRef}
        className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col items-start justify-end px-5 pb-8 md:px-10 md:pb-12"
      >
        <h1
          ref={headingRef}
          data-hero-hide
          className="invisible text-[clamp(2.4rem,4.4vw,5rem)] leading-[0.92]"
        >
          <span className="sr-only">{hero.seoHeading}</span>
          <span aria-hidden="true">
            {hero.headline.map((line, i) => (
              <span
                key={line}
                className={cn("block", i === 1 && "text-accent")}
              >
                {line.split(" ").map((word, w) => (
                  <Fragment key={w}>
                    <span className="inline-block overflow-hidden py-[0.05em] align-top">
                      {word.split("").map((char, c) => (
                        <span
                          key={c}
                          data-hero-char
                          className="inline-block will-change-transform"
                        >
                          {char}
                        </span>
                      ))}
                    </span>{" "}
                  </Fragment>
                ))}
              </span>
            ))}
          </span>
        </h1>

        <p
          data-hero-hide
          data-hero-copy
          className="invisible mt-5 max-w-[40rem] text-[1.0625rem] leading-[1.55] text-bone/85 md:mt-6 md:text-xl lg:text-[clamp(1.15rem,1.2vw,1.4rem)]"
        >
          {hero.body.split(" ").map((word, i) => (
            <Fragment key={i}>
              <span data-hero-body-word className="inline-block">
                {word}
              </span>{" "}
            </Fragment>
          ))}
        </p>

        <div
          data-hero-hide
          data-hero-social
          className="invisible mt-7 lg:absolute lg:bottom-12 lg:right-10 lg:mt-0"
        >
          <SocialDock
            items={hero.socials}
            className="bg-transparent p-0 backdrop-blur-none"
          />
        </div>
      </div>
    </section>
  );
}
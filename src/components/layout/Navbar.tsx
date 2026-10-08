"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { CaretDown, List, X } from "@phosphor-icons/react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { bookCta, contact, navLinks, socialLinks } from "@/data/nav";

const MotionLink = motion.create(Link);
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Desktop link: dims siblings on list hover, lifts slightly, brightens itself */
const desktopLinkClass =
  "group relative inline-flex items-center gap-1.5 py-2 text-[17px] font-semibold tracking-[0.005em] text-bone/85 transition-[color,transform] duration-500 ease-out group-hover/list:text-bone/45 hover:-translate-y-px hover:text-bone! focus-visible:text-bone! focus-visible:outline-none";

/* The Strike: a tapered red slash that draws in from the left and exits to the right */
const slashClass =
  "pointer-events-none absolute -bottom-0.5 left-0 h-[3px] w-full origin-right scale-x-0 bg-accent [clip-path:polygon(0_100%,100%_0,100%_100%)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100";

const ctaClass =
  "group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-bone/40 px-6 py-2.5 text-[15px] font-semibold text-bone transition-colors duration-500 hover:border-accent focus-visible:border-accent focus-visible:outline-none";

const ctaFillClass =
  "absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };

  const scheduleCloseServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 140);
  };

  const closeAll = () => {
    setOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  /* Intro animation */
  useGSAP(
    () => {
      gsap.from("[data-nav-intro]", {
        yPercent: -60,
        autoAlpha: 0,
        duration: 0.9,
        ease: "power4.out",
        stagger: 0.08,
        delay: 0.2,
      });
    },
    { scope: headerRef }
  );

  /* Scrolled state (the navbar always stays visible at a fixed height) */
  useGSAP(
    () => {
      setScrolled(window.scrollY > 40);

      ScrollTrigger.create({
        start: 40,
        end: "max",
        onToggle: (self) => setScrolled(self.isActive),
      });
    },
    { scope: headerRef }
  );

  /* Mobile menu timeline: clip-path wipe, mask-reveal lines, fade extras */
  useGSAP(
    () => {
      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power4.inOut" },
      });

      tl.fromTo(
        overlayRef.current,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8 }
      )
        .fromTo(
          "[data-menu-line]",
          { yPercent: 140 },
          { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.07 },
          0.35
        )
        .fromTo(
          "[data-menu-fade]",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06 },
          0.75
        );

      tlRef.current = tl;
    },
    { scope: overlayRef }
  );

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;

    if (open) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.6).reverse();
    }
  }, [open]);

  /* Scroll lock while the menu is open */
  useEffect(() => {
    document.documentElement.classList.toggle("overflow-hidden", open);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [open]);

  /* Escape to close, auto close when resizing to desktop */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setServicesOpen(false);
      }
    };
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const solid = scrolled && !open;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2 focus:text-bone"
      >
        Skip to content
      </a>

      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
        <div className="relative">
          {/* Top fade for readability over photography */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 bg-linear-to-b from-ink/80 to-transparent transition-opacity duration-500",
              solid || open ? "opacity-0" : "opacity-100"
            )}
          />
          {/* Solid blurred background after scroll */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 border-b border-white/10 bg-ink/75 backdrop-blur-xl transition-opacity duration-500",
              solid ? "opacity-100" : "opacity-0"
            )}
          />

          <nav
            aria-label="Primary"
            className="relative mx-auto flex h-[72px] max-w-[1600px] items-center justify-between px-5 md:h-24 md:px-10"
          >
            {/* Logo */}
            <Link
              href="/"
              onClick={closeAll}
              aria-label="The Hooker Lab home"
              data-nav-intro
              className="relative block shrink-0"
            >
              <Image
                src="/logo/logo.png"
                alt="The Hooker Lab"
                width={1774}
                height={887}
                priority
                sizes="(min-width: 768px) 128px, 96px"
                className="h-12 w-auto mix-blend-screen md:h-16"
              />
            </Link>

            {/* Desktop links */}
            <ul className="group/list hidden items-center gap-9 lg:flex xl:gap-11">
              {navLinks.map((item) =>
                item.children ? (
                  <li
                    key={item.label}
                    data-nav-intro
                    className="relative"
                    onMouseEnter={openServices}
                    onMouseLeave={scheduleCloseServices}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setServicesOpen(false);
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={servicesOpen}
                      onClick={() => setServicesOpen((v) => !v)}
                      className={cn(
                        desktopLinkClass,
                        servicesOpen && "text-bone!"
                      )}
                    >
                      {item.label}
                      <CaretDown
                        size={13}
                        weight="bold"
                        className={cn(
                          "transition-transform duration-300",
                          servicesOpen && "rotate-180"
                        )}
                      />
                      <span
                        aria-hidden="true"
                        className={cn(
                          slashClass,
                          servicesOpen && "origin-left scale-x-100"
                        )}
                      />
                    </button>

                    {/* Dropdown */}
                    <div
                      className={cn(
                        "absolute left-1/2 top-full w-[390px] -translate-x-1/2 pt-5",
                        !servicesOpen && "pointer-events-none"
                      )}
                    >
                      <AnimatePresence>
                        {servicesOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="origin-top overflow-hidden rounded-2xl border border-white/10 bg-ink/90 p-2 shadow-2xl backdrop-blur-xl"
                          >
                            <ul>
                              {item.children.map((child, i) => (
                                <motion.li
                                  key={child.href}
                                  initial={{ opacity: 0, x: -12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{
                                    duration: 0.4,
                                    ease: EASE,
                                    delay: 0.08 + i * 0.05,
                                  }}
                                >
                                  <Link
                                    href={child.href}
                                    onClick={closeAll}
                                    className="group/item relative flex items-start gap-4 rounded-xl px-4 py-3.5 transition-colors duration-300 hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none"
                                  >
                                    <span
                                      aria-hidden="true"
                                      className="absolute bottom-3 left-0 top-3 w-0.5 origin-center scale-y-0 bg-accent transition-transform duration-300 group-hover/item:scale-y-100 group-focus-visible/item:scale-y-100"
                                    />
                                    <span className="mt-0.5 font-display text-sm font-bold text-accent">
                                      {String(i + 1).padStart(2, "0")}
                                    </span>
                                    <span className="flex flex-col gap-0.5">
                                      <span className="text-base font-semibold text-bone">
                                        {child.title}
                                      </span>
                                      <span className="text-sm text-mist">
                                        {child.description}
                                      </span>
                                    </span>
                                  </Link>
                                </motion.li>
                              ))}
                            </ul>
                            <div className="mt-1 border-t border-white/10 px-4 pb-2 pt-3">
                              <Link
                                href={item.href}
                                onClick={closeAll}
                                className="text-sm font-medium text-mist transition-colors duration-300 hover:text-bone"
                              >
                                View all services
                              </Link>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </li>
                ) : (
                  <li key={item.label} data-nav-intro>
                    <Link href={item.href} className={desktopLinkClass}>
                      {item.label}
                      <span aria-hidden="true" className={slashClass} />
                    </Link>
                  </li>
                )
              )}
            </ul>

            <div className="flex items-center gap-3">
              {/* Desktop CTA */}
              <div data-nav-intro className="hidden lg:block">
                <MotionLink
                  href={bookCta.href}
                  whileTap={{ scale: 0.96 }}
                  className={ctaClass}
                >
                  <span aria-hidden="true" className={ctaFillClass} />
                  <span className="relative">{bookCta.label}</span>
                </MotionLink>
              </div>

              {/* Mobile toggle */}
              <motion.button
                type="button"
                data-nav-intro
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setOpen((v) => !v);
                  setMobileServicesOpen(false);
                }}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="relative flex size-11 items-center justify-center text-bone lg:hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={open ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    {open ? (
                      <X size={30} weight="bold" />
                    ) : (
                      <List size={30} weight="bold" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div
        id="mobile-menu"
        ref={overlayRef}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed inset-0 z-40 flex flex-col overflow-y-auto overscroll-contain bg-ink px-6 pb-10 pt-28 transition-[visibility] duration-0 md:px-10 lg:hidden",
          open ? "visible" : "pointer-events-none invisible delay-[1000ms]"
        )}
      >
        <ul className="flex flex-col">
          {navLinks.map((item, i) => {
            const index = String(i + 1).padStart(2, "0");
            const rowClass =
              "block w-full py-3.5 text-left font-display text-5xl font-bold leading-none tracking-tight text-bone transition-colors duration-300 hover:text-accent sm:text-6xl";

            if (item.children) {
              return (
                <li key={item.label} className="overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={mobileServicesOpen}
                    onClick={() => setMobileServicesOpen((v) => !v)}
                    className={rowClass}
                  >
                    <span
                      data-menu-line
                      className="flex w-full items-baseline gap-5"
                    >
                      <span className="font-body text-sm font-medium tracking-[0.2em] text-accent">
                        {index}
                      </span>
                      {item.label}
                      <CaretDown
                        size={22}
                        weight="bold"
                        className={cn(
                          "ml-auto self-center text-mist transition-transform duration-300",
                          mobileServicesOpen && "rotate-180 text-accent"
                        )}
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {mobileServicesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <ul className="flex flex-col gap-1 pb-5 pl-12 pt-2">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={closeAll}
                                className="block py-2.5 text-lg font-medium text-mist transition-colors duration-300 hover:text-bone"
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            return (
              <li key={item.label} className="overflow-hidden">
                <Link href={item.href} onClick={closeAll} className={rowClass}>
                  <span data-menu-line className="flex items-baseline gap-5">
                    <span className="font-body text-sm font-medium tracking-[0.2em] text-accent">
                      {index}
                    </span>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto flex flex-col gap-7 pt-12">
          <div data-menu-fade>
            <Link
              href={bookCta.href}
              onClick={closeAll}
              className={cn(ctaClass, "w-full py-3.5 text-base")}
            >
              <span aria-hidden="true" className={ctaFillClass} />
              <span className="relative">{bookCta.label}</span>
            </Link>
          </div>

          <div
            data-menu-fade
            className="flex items-center justify-between border-t border-line pt-6"
          >
            <a
              href={`mailto:${contact.email}`}
              className="text-sm tracking-wide text-mist transition-colors duration-300 hover:text-bone"
            >
              {contact.email}
            </a>
            <ul className="flex items-center gap-4">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-mist transition-colors duration-300 hover:text-accent"
                  >
                    <Icon size={22} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <p
            data-menu-fade
            className="font-display text-sm font-bold uppercase tracking-[0.3em] text-mist"
          >
            {contact.tagline}
          </p>
        </div>
      </div>
    </>
  );
}
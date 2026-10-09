import Image from "next/image";
import Link from "next/link";

import {
  contact,
  navLinks,
  serviceLinks,
  socialLinks,
} from "@/data/nav";

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Refund & Cancellation", href: "/refund-and-cancellation" },
];

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

const link = `text-[15px] normal-case leading-snug text-bone/70 transition-colors duration-200 hover:text-accent focus-visible:text-accent ${focus}`;

const heading =
  "font-body text-xs font-medium uppercase leading-none tracking-[0.24em] text-bone/45";

const iconButton =
  "grid h-10 w-10 place-items-center rounded-full border border-bone/20 text-bone transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-bone focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-bone">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12 lg:gap-x-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <Link href="/" aria-label="The Hooker Lab home" className={`inline-block ${focus}`}>
              <Image
                src="/logo/logo.png"
                alt="The Hooker Lab"
                width={200}
                height={64}
                className="h-12 w-auto md:h-14"
              />
            </Link>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-bone/65">
              Specialist hooker coaching led by professional hooker Kurt
              Eklund. Throwing, lineout, scrummaging, mental skills and
              leadership for players, schools, clubs and unions across New
              Zealand.
            </p>
          </div>

          {/* Explore */}
          <nav aria-label="Explore" className="lg:col-span-2">
            <h2 className={heading}>Explore</h2>
            <ul className="mt-5 space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services (all point to the Programmes section) */}
          <nav aria-label="Services" className="lg:col-span-3">
            <h2 className={heading}>Services</h2>
            <ul className="mt-5 space-y-3">
              {serviceLinks.map((s) => (
                <li key={s.title}>
                  <Link href="/#programmes" className={link}>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Get in touch */}
          <div className="col-span-2 lg:col-span-3">
            <h2 className={heading}>Get in touch</h2>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={`mailto:${contact.email}`} className={`break-all ${link}`}>
                  {contact.email}
                </a>
              </li>
            </ul>

            <ul className="mt-5 flex gap-2.5">
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  aria-label="Email"
                  className={iconButton}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4.5 w-4.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </a>
              </li>
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className={iconButton}
                  >
                    <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-bone/10 pt-6 text-sm text-bone/50 md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} The Hooker Lab. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`transition-colors duration-200 hover:text-accent focus-visible:text-accent ${focus}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
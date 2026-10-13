import type { IconType } from "react-icons";
import { SiInstagram } from "react-icons/si";

export type ServiceLink = {
  title: string;
  href: string;
  description: string;
};

export type NavItem = {
  label: string;
  href: string;
};

export const serviceLinks: readonly ServiceLink[] = [
  {
    title: "Individual Hooker Coaching",
    href: "/services/individual-hooker-coaching",
    description: "One-on-one coaching built around your game.",
  },
  {
    title: "Small Group Coaching",
    href: "/services/small-group-coaching",
    description: "Quality repetitions alongside other hookers.",
  },
  {
    title: "School & Club Coaching",
    href: "/services/school-and-club-coaching",
    description: "Specialist development for players and coaches.",
  },
  {
    title: "Provincial & Union Development",
    href: "/services/provincial-and-union-development",
    description: "Programmes for representative rugby environments.",
  },
];

export const navLinks: readonly NavItem[] = [
  { label: "Philosophy", href: "/#philosophy" },
  { label: "Services", href: "/#programmes" },
  
  { label: "Expertise", href: "/#expertise" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
  { label: "FAQ", href: "/faq" },
  
];

export const bookCta = {
  label: "Book a session",
  href: "/#contact",
} as const;

/* The contact email lives in site settings (admin → Settings); only the tagline is static. */
export const brand = {
  tagline: "Throw. Scrum. Lead.",
} as const;

type Social = { label: string; href: string; icon: IconType };

export const socialLinks: Social[] = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/kurteklund05/",
    icon: SiInstagram,
  },
];
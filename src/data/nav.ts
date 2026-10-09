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
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#programmes" },
  { label: "Philosophy", href: "/#philosophy" },
  { label: "Expertise", href: "/#expertise" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/#contact" },
];

export const bookCta = {
  label: "Book a session",
  href: "/#contact",
} as const;

export const contact = {
  email: "admin@thehookerlab.co.nz",
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
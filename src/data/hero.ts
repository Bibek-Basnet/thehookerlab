import { SiGmail } from "react-icons/si";

import { socialLinks } from "@/data/nav";

export const hero = {
  image: {
    src: "/images/hero1.jpg",
    alt: "Rugby team performing a haka before a match, in black and white",
    positionClass: "object-[50%_35%]",
  },
    cta: { label: "Enquire now", href: "/#contact" },
  seoHeading: "The Hooker Lab: ",
  headline: ["Specialist Position.", "Specialist Coaching."],
  body: "Specialist hooker coaching led by professional hooker Kurt Eklund. Throwing, lineout, scrummaging, mental skills and leadership for players, schools, clubs and unions across New Zealand.",
  emailIcon: SiGmail,
  socials: [
    ...socialLinks,
  ],
};
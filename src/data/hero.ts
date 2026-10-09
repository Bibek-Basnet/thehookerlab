import { SiGmail } from "react-icons/si";

import { contact, socialLinks } from "@/data/nav";

export const hero = {
  image: {
    src: "/images/hero1.jpg",
    alt: "Rugby team performing a haka before a match, in black and white",
    /* Move the focus of the crop, e.g. object-[60%_30%] */
    positionClass: "object-[50%_35%]",
  },
  seoHeading: "The Hooker Lab: ",
  headline: ["Specialist Position.", "Specialist Coaching."],
  body: "Specialist hooker coaching led by professional hooker Kurt Eklund. Throwing, lineout, scrummaging, mental skills and leadership for players, schools, clubs and unions across New Zealand.",
  socials: [
    ...socialLinks,
    { label: "Email", href: `mailto:${contact.email}`, icon: SiGmail },
  ],
};
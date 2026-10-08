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
  body: "Hooker is one of the most technical positions in rugby. We develop the complete hooker, not just someone who can throw: accurate under pressure, strong at scrum time, sharp at the lineout and ready to lead. Better coaching builds better hookers.",
  socials: [
    ...socialLinks,
    { label: "Email", href: `mailto:${contact.email}`, icon: SiGmail },
  ],
};
type Tier = "featured" | "plain";

type RepresentedTeam = {
  team: string;
  note: string;
  tier: Tier;
  logo?: string;
};

export const about = {
  eyebrow: "About your coach",
  headline: ["Toughness.", "Consistency.", "Leadership."],
  image: {
    src: "/images/about.jpg",
    alt: "Kurt Eklund, professional rugby hooker and founder of The Hooker Lab",
    positionClass: "object-center",
  },
  caption: { name: "Kurt Eklund", detail: "Ngāti Kahu" },
  statement:
    "Kurt Eklund (Ngāti Kahu), known as Kurty, is a professional rugby hooker with over a decade at the highest levels of New Zealand rugby, built on toughness, consistency, leadership and a deep understanding of the hooker position.",
  closing:
    "Through The Hooker Lab, he now helps develop the next generation of hookers with specialist, practical coaching.",
  stats: [
    { value: 10, suffix: "+", label: "Years at the top level" },
    { value: 7, suffix: "", label: "Sides represented" },
    { value: 2, suffix: "", label: "Captaincies" },
  ],
  representedTitle: "Represented",
  represented: [
    {
      team: "Māori All Blacks",
      note: "Captain 2025",
      tier: "featured",
      logo: "/logo/maori.png",
    },
    {
      team: "Bay of Plenty",
      note: "Captain",
      tier: "plain",
      logo: "/logo/bay.png",
    },
    { team: "Blues", note: "", tier: "plain", logo: "/logo/blues.png" },
    { team: "Auckland", note: "", tier: "plain", logo: "/logo/auckland.png" },
    { team: "North Island", note: "", tier: "plain" },
    { team: "ANZAC XV", note: "", tier: "plain", logo: "/logo/anzv.avif" },
    {
      team: "All Blacks XV",
      note: "",
      tier: "plain",
      logo: "/logo/allblack.svg",
    },
  ] satisfies RepresentedTeam[],
  honours: ["Blues Player of the Year", "Māori Player of the Year nominee"],
} as const;
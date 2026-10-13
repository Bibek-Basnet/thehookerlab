type RepresentedTeam = {
  team: string;
  note: string;
  logo?: string;
  logoStyle?: "mono" | "tile";
};

type Honour = {
  title: string;
  year: string;
};

const represented: RepresentedTeam[] = [
  {
    team: "Māori All Blacks",
    note: "Captain 2025",
    logo: "/logo/maori.png",
  },
  {
    team: "Bay of Plenty",
    note: "Captain",
    logo: "/logo/bay.png",
  },
  { team: "Blues", note: "", logo: "/logo/blues.png" },
  { team: "Auckland", note: "", logo: "/logo/auckland.png" },
  { team: "ANZAC XV", note: "", logo: "/logo/anzv.avif" },
  {
    team: "All Blacks XV",
    note: "",
    logo: "/logo/allblack.svg",
  },
];

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
    { value: represented.length, suffix: "", label: "Sides represented" },
    { value: 2, suffix: "", label: "Captaincies" },
  ],
  representedTitle: "Represented",
  represented,
  honours: [
    { title: "Blues Player of the Year", year: "2022" },
    { title: "Māori Player of the Year nominee", year: "2025" },
  ] satisfies Honour[],
} as const;
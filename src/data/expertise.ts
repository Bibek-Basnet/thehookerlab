type Skill = {
  name: string;
  detail: string;
};

type Pillar = {
  id: string;
  image: string;
  alt: string;
  word: string;
  summary: string;
  /* true: skill detail sits in a compact card with arrows. false: plain one-liner */
  panel: boolean;
  skills: Skill[];
};

export const expertise: {
  eyebrow: string;
  headline: { plain: string; accent: string };
  intro: string;
  pillars: Pillar[];
} = {
  eyebrow: "Expertise",
  headline: { plain: "The complete", accent: "hooker." },
  intro:
    "The Hooker Lab specialises in twelve areas across three pillars: the throw, the scrum and the leadership that ties them together.",
  pillars: [
    {
      id: "throw",
      image: "/images/expertise2.jpg",
      alt: "A hooker throwing into the lineout",
      word: "Throw",
      summary:
        "The skill every hooker is judged on, built on technique, timing and accuracy.",
      panel: false,
      skills: [
        {
          name: "Hooker throwing",
          detail: "Clean, repeatable mechanics from grip to release.",
        },
        {
          name: "Throwing accuracy",
          detail: "Accuracy that holds when the game speeds up.",
        },
        {
          name: "Lineout technique",
          detail: "Timing and delivery that give your jumpers a clean ball.",
        },
        {
          name: "Set-piece understanding",
          detail: "How the throw, the jump and the lift fit together.",
        },
      ],
    },
    {
      id: "scrum",
      image: "/images/expertise.jpeg",
      alt: "A front row engaging at scrum time",
      word: "Scrum",
      summary:
        "The technical core of the position, developed one detail at a time.",
      panel: true,
      skills: [
        {
          name: "Body Position & Set-Up",
          detail:
            "Build a strong, balanced and technically correct scrummaging position.",
        },
        {
          name: "Connection & Force Transfer",
          detail:
            "Maintain tight binding and transfer power through the front row.",
        },
        {
          name: "Strike & Ball Control",
          detail:
            "Develop accurate striking technique and consistent control of the ball.",
        },
        {
          name: "Pressure, Stability & Game Management",
          detail:
            "Stay stable under pressure and make smart decisions during the scrum.",
        },
      ],
    },
    {
      id: "lead",
      image: "/images/expertise3.jpeg",
      alt: "A hooker leading the forward pack",
      word: "Lead",
      summary:
        "Where a good hooker becomes a great one: reading, deciding and leading.",
      panel: false,
      skills: [
        {
          name: "Building routines",
          detail: "Routines that make the throw and the scrum repeatable.",
        },
        {
          name: "Mental skills",
          detail: "Routines and focus for the moments that matter.",
        },
        {
          name: "Confidence",
          detail: "The self-belief to throw, scrum and lead under pressure.",
        },
        {
          name: "Leadership",
          detail: "Communicating and driving the team from the middle.",
        },
      ],
    },
  ],
};
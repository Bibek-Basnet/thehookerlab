type Option = {
  id: string;
  label: string;
  text: string;
};

type AccentTitle = {
  plain: string;
  accent: string;
};

export const workshops = {
  eyebrow: "Workshops",
  headline: ["Focused", "hooker", "workshops"],
  intro:
    "Focused workshops designed around the key areas of the hooker's role. Choose who the session is for and what it should cover, then send your enquiry.",

  included: [
    {
      title: "Led by a professional hooker",
      text: "Coaching from Kurt Eklund, a professional hooker with over a decade at the highest levels of New Zealand rugby.",
    },
    {
      title: "Tailored to your group",
      text: "Shaped around the age, experience and needs of the players in the room.",
    },
    {
      title: "Practical and game-specific",
      text: "Focused sessions with quality repetitions, built around what hookers do in a match.",
    },
    {
      title: "Skills that transfer",
      text: "Techniques and habits designed to carry straight into training and games.",
    },
  ],

  audienceStep: {
    title: { plain: "Who is the workshop", accent: "for?" } as AccentTitle,
    hint: "Choose one",
  },
  audiences: [
    {
      id: "schools",
      label: "Schools",
      text: "School teams and age groups.",
    },
    {
      id: "clubs",
      label: "Clubs",
      text: "Juniors through to senior grades.",
    },
    {
      id: "academies",
      label: "Academies",
      text: "Development squads building strong habits.",
    },
    {
      id: "provincial",
      label: "Provincial & unions",
      text: "Representative and provincial environments.",
    },
    {
      id: "coaches",
      label: "Coaches",
      text: "Forward and lineout coaches.",
    },
  ] as Option[],

  focusStep: {
    title: { plain: "What should it", accent: "focus" } as AccentTitle,
    titleEnd: "on?",
    hint: "Choose as many as you like",
  },
  topics: [
    {
      id: "throwing-technique",
      label: "Throwing technique and accuracy",
      text: "Hands-on throwing practice with live feedback on technique and accuracy.",
    },
    {
      id: "lineout-understanding",
      label: "Lineout understanding",
      text: "Calls, timing and decisions explained and practised as one unit.",
    },
    {
      id: "hooker-skills",
      label: "Hooker-specific skills",
      text: "Position-specific technical work that sits outside normal team training.",
    },
    {
      id: "mental-skills",
      label: "Mental skills",
      text: "Practical routines for pressure moments, applied during the session.",
    },
    {
      id: "confidence",
      label: "Confidence",
      text: "Structured repetitions and feedback that build belief in the skill.",
    },
    {
      id: "leadership",
      label: "Leadership",
      text: "How to communicate and lead the forward pack from the middle.",
    },
    {
      id: "game-understanding",
      label: "Game understanding",
      text: "Reading the game and making the right call, using match scenarios.",
    },
  ] as Option[],
  help: {
    title: "Not sure what you need?",
    text: "Choose what fits best and tell us about your group. We will help shape the rest.",
  },

  reviewStep: {
    title: { plain: "Review and send your", accent: "enquiry" } as AccentTitle,
    hint: "Check your choices, then send them to us.",
  },
  summary: {
    title: "Your workshop",
    group: "Group",
    groupEmpty: "Not chosen yet",
    focus: "Focus areas",
    focusEmpty: "None chosen yet",
  },
  nextTitle: "What happens next",
  next: [
    {
      title: "Send your enquiry",
      text: "Your choices come with it, so we know where to start.",
    },
    {
      title: "We get in touch",
      text: "We talk through your group, your goals and timing.",
    },
    {
      title: "Your workshop is shaped",
      text: "The session is built around the focus areas you picked.",
    },
  ],
  cta: {
    chosen: "Send workshop enquiry",
    empty: "Enquire about a workshop",
  },
};
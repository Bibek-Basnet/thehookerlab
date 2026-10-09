export type Step =
  | {
      id: string;
      label: string;
      kind: "choice" | "multi";
      question: string;
      helper?: string;
      options: readonly string[];
      optional?: false;
    }
  | {
      id: string;
      label: string;
      kind: "text" | "email" | "tel" | "textarea";
      question: string;
      helper?: string;
      placeholder?: string;
      autoComplete?: string;
      optional?: boolean;
      maxLength?: number;
    };

/* One question per step. Edit, reorder or reword freely. */
export const registerSteps: readonly Step[] = [
  {
    id: "role",
    label: "Registering as",
    kind: "choice",
    question: "Who is registering?",
    helper: "Choose the one that fits best.",
    options: ["A player", "A coach", "A parent or guardian", "A school or club"],
  },
  {
    id: "level",
    label: "Level of rugby",
    kind: "choice",
    question: "What level of rugby is this for?",
    helper: "The player, or the group you work with.",
    options: [
      "Just starting out",
      "School",
      "Club",
      "Provincial or representative",
      "Professional",
    ],
  },
  {
    id: "experience",
    label: "Hooker experience",
    kind: "choice",
    question: "How much experience at hooker?",
    helper: "For the player, or the group you coach.",
    options: ["New to hooker", "Under 2 years", "2 to 5 years", "5 years or more"],
  },
  {
    id: "focus",
    label: "Focus areas",
    kind: "multi",
    question: "What would you like to work on?",
    helper: "Choose as many as you like.",
    options: [
      "Throwing technique",
      "Throwing accuracy",
      "Lineout skills",
      "Scrummaging",
      "Hooker-specific skills",
      "Game understanding",
      "Decision-making",
      "Mental skills",
      "Confidence",
      "Leadership",
    ],
  },
  {
    id: "goal",
    label: "Main goal",
    kind: "textarea",
    question: "What's the main goal?",
    helper: "Optional. Anything that helps us shape the programme around you.",
    placeholder: "For example: more accuracy under pressure.",
    optional: true,
    maxLength: 600,
  },
  {
    id: "name",
    label: "Name",
    kind: "text",
    question: "What's your name?",
    placeholder: "Full name",
    autoComplete: "name",
  },
  {
    id: "email",
    label: "Email",
    kind: "email",
    question: "What's your email address?",
    helper: "We'll use this to follow up with you.",
    placeholder: "you@example.com",
    autoComplete: "email",
  },
  {
    id: "phone",
    label: "Phone",
    kind: "tel",
    question: "What's the best phone number?",
    helper: "Optional. Only if you'd like a call or text.",
    placeholder: "Phone number",
    autoComplete: "tel",
    optional: true,
  },
  {
    id: "location",
    label: "Location",
    kind: "text",
    question: "Where are you based?",
    helper: "Town or city and country, so we can plan around your time zone.",
    placeholder: "For example: Auckland, New Zealand",
    autoComplete: "address-level2",
  },
];

export const online = {
  eyebrow: "Online programme",
  headline: ["Online", "hooker", "programme"],
  intro:
    "A digital coaching programme designed to give hookers access to specialist coaching, drills and education wherever they are.",
  body: "Keep developing your skills outside of traditional coaching sessions, with resources you can return to throughout your development.",
  cta: {
    label: "Register now",
  },
  factsTitle: "At a glance",
  facts: [
    { label: "Format", value: "Online" },
    { label: "Access", value: "Wherever you are" },
    { label: "Includes", value: "Coaching, drills and education" },
    { label: "Price", value: "$00" },
  ],
  insideTitle: "What's inside",
  items: [
    {
      id: "coaching",
      title: "Specialist coaching",
      text: "Guidance from a professional hooker, built around the position and your development.",
      points: [
        "Throwing technique and accuracy",
        "Lineout skills and scrummaging",
        "Mental skills, confidence and leadership",
      ],
    },
    {
      id: "drills",
      title: "Drills",
      text: "A library of drills and resources to practise from, wherever you are.",
      points: [
        "Practise outside coaching sessions",
        "Position-specific drills",
        "Resources to return to",
      ],
    },
    {
      id: "education",
      title: "Education",
      text: "Understand the game, the lineout and the decisions behind every skill.",
      points: [
        "Game understanding",
        "Lineout understanding",
        "Decision-making",
      ],
    },
  ],
  benefitsTitle: "Why train online",
  benefits: [
    {
      title: "Train wherever you are",
      text: "Access specialist coaching without needing to be at a session.",
    },
    {
      title: "Keep developing between sessions",
      text: "Continue building your skills outside traditional coaching sessions.",
    },
    {
      title: "Resources to return to",
      text: "Come back to the drills and education at any stage of your development.",
    },
    {
      title: "Coached by a professional",
      text: "Guidance from Kurt Eklund, a professional hooker with over a decade at the highest levels of New Zealand rugby.",
    },
  ],
  register: {
    title: "Register for the online programme",
    note: "A few quick questions so we can tailor the programme to you.",
    back: "Back",
    skip: "Skip",
    next: "Continue",
    save: "Save and review",
    edit: "Edit",
    notProvided: "Not provided",
    reviewTitle: "Check your details",
    reviewHelper: "Make sure everything looks right, then confirm below.",
    privacyHref: "/privacy-policy",
    privacyStart: "I have read and agree to the ",
    privacyLink: "Privacy Policy",
    privacyEnd:
      ", and I consent to The Hooker Lab contacting me about the online programme.",
    privacyError: "Please accept the Privacy Policy to register.",
    submit: "Submit registration",
    submitting: "Submitting",
    successTitle: "You're registered",
    successText: "Thanks for registering. We'll follow up with you directly.",
    successClose: "Close",
    error: "Something went wrong. Please try again.",
  },
} as const;
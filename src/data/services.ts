export const services = {
  eyebrow: "Programmes",
  headline: ["Choose how", "you train."],
  items: [
    {
      id: "individual",
      number: "01",
      format: "One-on-one",
      title: "Individual Hooker Coaching",
      summary:
        "One on one specialist coaching tailor made to the individuals needs.",
      listTitle: "At a glance",
      points: [
        "Throwing technique and accuracy",
        "Lineout skills and scrummaging",
        "Game understanding and decisions",
        "Mental skills and leadership",
      ],
      image: {
        src: "/images/services/services1.jpg",
        alt: "Kurt Eklund coaching a hooker one-on-one",
      },
    },
    {
      id: "small-group",
      number: "02",
      format: "Small group",
      title: "Small Group Coaching",
      summary:
        "Specialist coaching for small groups of hookers, allowing players to maximise quality repetitions while learning alongside other hookers.",
      listTitle: "At a glance",
      points: [
        "Maximum quality repetitions",
        "Learn alongside other hookers",
        "Focused and practical",
        "Game-specific sessions",
      ],
      image: {
        src: "/images/services/services2.jpg",
        alt: "A small group of hookers training together",
      },
    },
    {
      id: "school-club",
      number: "03",
      format: "Schools and clubs",
      title: "School & Club Coaching",
      summary:
        "The Hooker Lab works with schools and clubs to provide specialist hooker development for players and coaches.",
      listTitle: "At a glance",
      points: [
        "For players and coaches",
        "Tailored to the group",
        "Matched to experience level",
        "Schools and clubs",
      ],
      image: {
        src: "/images/services/services3.jpg",
        alt: "Hooker coaching session with a school or club team",
      },
    },
    {
      id: "provincial-union",
      number: "04",
      format: "Representative rugby",
      title: "Provincial & Union Development",
      summary:
        "Specialist hooker development programmes for representative and provincial rugby environments.",
      listTitle: "At a glance",
      points: [
        "Representative environments",
        "Provincial environments",
        "Technically strong, confident hookers",
        "Performs under pressure",
      ],
      image: {
        src: "/images/services/services6.jpg",
        alt: "Representative hooker development programme",
      },
    },
  ],
} as const;
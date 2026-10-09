type Option = { id: string; label: string };

export const contact = {
  eyebrow: "Contact",
  headline: ["Get in", "touch"],
  intro:
    "Tell us about the player or group and what you want to achieve, and we will reply by email to talk through the next steps.",

  /* The only way to get in touch */
  email: "admin@thehookerlab.co.nz",
  emailNote: "Prefer to write directly? Email us at",

  form: {
    title: "Send an enquiry",
    hint: "A few quick questions so we can reply properly. Anything marked optional can be skipped.",
    typeTitle: "What is your enquiry about?",
    aboutTitle: "About you",
    detailsTitle: "More details",
    detailsHint: "Optional, but it helps us prepare a better reply.",
    detailsOpen: "Add more details",
    detailsClose: "Hide extra details",
    messageTitle: "Your message",
  },

  fields: {
    name: "Full name",
    namePlaceholder: "Your full name",
    email: "Email address",
    emailPlaceholder: "name@example.com",
    
    role: "Who are you?",
    rolePlaceholder: "Choose one",
    rolePlayerHint:
      "Players under 18: please ask a parent or guardian to send this enquiry.",
    organisation: "School, club or organisation",
    organisationPlaceholder: "Name of your school, club or organisation",
    ageGroup: "Age group of the player or players",
    level: "Current playing level",
    groupSize: "Size of the group",
    location: "Where are you based?",
    locationPlaceholder: "Town, city or region",
    timing: "When would you like to start?",
    choose: "Choose one",
    message: "How can we help?",
    messageHint:
      "Helpful to include: the player's age and level (or the size of your group), what you want to improve, and any dates or locations that matter.",
    messagePlaceholder:
      "Tell us about the player or group and what you want to achieve.",
    consent:
      "I agree that The Hooker Lab can contact me by email about this enquiry.",
    privacy: "We will only use your details to reply to your enquiry.",
  },

  actions: {
    send: "Send enquiry",
    sending: "Sending your enquiry",
    another: "Send another enquiry",
  },

  success: {
    title: "Thank you,",
    text: "Your enquiry has been sent. We will reply to you by email.",
    summaryAbout: "About",
    summaryFrom: "From",
    summaryReply: "Reply to",
  },
  error: {
    text: "Your enquiry could not be sent. Please try again, or email us directly:",
  },

  enquiryTypes: [
    { id: "individual", label: "Individual coaching" },
    { id: "small-group", label: "Small group coaching" },
    { id: "school-club", label: "School or club coaching" },
    { id: "provincial", label: "Provincial or union development" },
    { id: "other", label: "Something else" },
  ] as Option[],

  roles: [
    { id: "player", label: "Player" },
    { id: "parent", label: "Parent or guardian" },
    { id: "coach", label: "Coach" },
    { id: "school", label: "School" },
    { id: "club", label: "Club" },
    { id: "academy", label: "Academy" },
    { id: "union", label: "Provincial union or organisation" },
    { id: "other", label: "Other" },
  ] as Option[],

  ageGroups: [
    { id: "under-12", label: "Under 12" },
    { id: "12-14", label: "12 to 14" },
    { id: "15-18", label: "15 to 18" },
    { id: "adult", label: "19 and over" },
    { id: "mixed", label: "Mixed ages" },
  ] as Option[],

  levels: [
    { id: "starting", label: "Just starting out" },
    { id: "school", label: "School rugby" },
    { id: "club", label: "Club rugby" },
    { id: "representative", label: "Representative or provincial" },
    { id: "senior", label: "Senior or professional" },
  ] as Option[],

  groupSizes: [
    { id: "2-5", label: "2 to 5 players" },
    { id: "6-10", label: "6 to 10 players" },
    { id: "11-20", label: "11 to 20 players" },
    { id: "20-plus", label: "More than 20 players" },
  ] as Option[],

  timings: [
    { id: "asap", label: "As soon as possible" },
    { id: "month", label: "Within the next month" },
    { id: "quarter", label: "In the next 1 to 3 months" },
    { id: "exploring", label: "Just exploring for now" },
  ] as Option[],

  /* Roles that need an organisation name */
  orgRoles: ["school", "club", "academy", "union"],
  /* Enquiry types that ask for a group size */
  groupTypes: ["small-group", "school-club", "provincial"],
};
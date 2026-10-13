/* Cache tags shared by the public readers and the admin server actions. */
export const TAGS = {
  programs: "content:programs",
  expertise: "content:expertise",
  testimonials: "content:testimonials",
  faqs: "content:faqs",
  sections: "content:sections",
  settings: "content:settings",
} as const;

export type ContentTag = (typeof TAGS)[keyof typeof TAGS];

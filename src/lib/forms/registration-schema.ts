import { z } from "zod";

import { registerSteps } from "@/data/online";

/* Option lists come from the same data the dialog renders, so they cannot drift. */
const optionsOf = (id: string) => {
  const step = registerSteps.find((s) => s.id === id);
  if (!step || !("options" in step)) {
    throw new Error(`register step ${id} has no options`);
  }
  return step.options as unknown as [string, ...string[]];
};

export const registrationSchema = z.object({
  role: z.enum(optionsOf("role")),
  level: z.enum(optionsOf("level")),
  experience: z.enum(optionsOf("experience")),
  focusAreas: z.array(z.enum(optionsOf("focus"))).max(20).default([]),
  goal: z.string().trim().max(600).default(""),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).default(""),
  location: z.string().trim().min(1).max(120),
  privacyAccepted: z.literal(true),
  acceptedAt: z.string().datetime(),
  source: z.literal("online-programme"),
  /* Honeypot: hidden "company" field; a filled value means a bot. */
  company: z.string().max(200).default(""),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

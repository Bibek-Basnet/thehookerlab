import type { FieldDef } from "@/lib/admin/fields";

export const pillarFields: FieldDef[] = [
  { kind: "text", name: "word", label: "Word", placeholder: "Throw" },
  {
    kind: "slug",
    name: "slug",
    label: "Slug",
    hint: "Leave empty to generate from the word",
  },
  { kind: "textarea", name: "summary", label: "Summary", rows: 2 },
  { kind: "image", name: "imageSrc", label: "Image" },
  { kind: "text", name: "imageAlt", label: "Image description" },
  {
    kind: "pairs",
    name: "skills",
    label: "Skills",
    labels: ["Skill name", "One-line detail"],
    max: 8,
  },
  {
    kind: "toggle",
    name: "panel",
    label: "Show skill detail in a card with arrows",
    hint: "Off shows a plain one-liner.",
  },
  { kind: "toggle", name: "published", label: "Published" },
];

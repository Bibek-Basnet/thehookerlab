import type { FieldDef } from "@/lib/admin/fields";

export const testimonialFields: FieldDef[] = [
  { kind: "text", name: "name", label: "Name" },
  {
    kind: "text",
    name: "role",
    label: "Role",
    placeholder: "Hooker, Lock, Coach…",
  },
  { kind: "text", name: "org", label: "Team or organisation" },
  { kind: "image", name: "imageSrc", label: "Photo" },
  { kind: "textarea", name: "quote", label: "Quote", rows: 4 },
  { kind: "toggle", name: "published", label: "Published" },
];

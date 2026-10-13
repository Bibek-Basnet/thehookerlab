import type { FieldDef } from "@/lib/admin/fields";

export const faqFields: FieldDef[] = [
  { kind: "text", name: "question", label: "Question" },
  { kind: "textarea", name: "answer", label: "Answer", rows: 5 },
  { kind: "toggle", name: "published", label: "Published" },
];

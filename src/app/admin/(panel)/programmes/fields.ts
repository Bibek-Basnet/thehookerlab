import type { FieldDef } from "@/lib/admin/fields";

export const programFields: FieldDef[] = [
  { kind: "text", name: "title", label: "Title" },
  {
    kind: "slug",
    name: "slug",
    label: "Slug",
    hint: "Leave empty to generate from the title",
  },
  {
    kind: "text",
    name: "format",
    label: "Format pill",
    placeholder: "Online, One-on-one, Small group…",
  },
  { kind: "textarea", name: "summary", label: "Summary", rows: 3 },
  {
    kind: "text",
    name: "listTitle",
    label: "List title",
    placeholder: "At a glance",
  },
  { kind: "list", name: "points", label: "Points", max: 8 },
  { kind: "image", name: "imageSrc", label: "Image" },
  { kind: "text", name: "imageAlt", label: "Image description" },
  {
    kind: "text",
    name: "price",
    label: "Price",
    hint: "Number only, e.g. 150 or 149.50. Leave empty for no price.",
  },
  {
    kind: "text",
    name: "priceNote",
    label: "Price note",
    placeholder: "per week, per session, from…",
  },
  {
    kind: "toggle",
    name: "priceFrom",
    label: "Show \"From\" before the price",
    hint: "On: \"From $199 per session\". Off: \"$99 per week\".",
  },
  {
    kind: "toggle",
    name: "showPrice",
    label: "Show price on the site",
    hint: "Also needs the global pricing switch in Settings.",
  },
  { kind: "toggle", name: "published", label: "Published" },
];

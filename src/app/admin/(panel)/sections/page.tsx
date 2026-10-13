import PageHeader from "@/components/admin/PageHeader";
import ResourceForm from "@/components/admin/ResourceForm";
import { Panel } from "@/components/admin/fields";
import { saveSection } from "@/lib/admin/actions/sections";
import type { FieldDef } from "@/lib/admin/fields";
import { requireAdmin } from "@/lib/auth/dal";
import { getDb } from "@/lib/db/client";
import { SECTION_KEYS, sectionCopy, type SectionKey } from "@/lib/db/schema";

export const metadata = { title: "Section copy" };

const base: FieldDef[] = [
  { kind: "text", name: "eyebrow", label: "Eyebrow" },
  {
    kind: "textarea",
    name: "headline",
    label: "Headline",
    rows: 2,
    hint: "One line per visual line.",
  },
];
const accent: FieldDef = {
  kind: "text",
  name: "headlineAccent",
  label: "Accent word",
  hint: "Rendered in red after the headline.",
};
const intro: FieldDef = {
  kind: "textarea",
  name: "intro",
  label: "Intro",
  rows: 3,
};
const cta: FieldDef[] = [
  { kind: "text", name: "ctaLabel", label: "Button label" },
  { kind: "text", name: "ctaHref", label: "Button link" },
];
const hero: FieldDef = { kind: "image", name: "heroImage", label: "Hero image" };

const fieldsFor: Record<SectionKey, FieldDef[]> = {
  programs: [...base, ...cta],
  expertise: [...base, accent, intro],
  testimonials: [...base, accent],
  faq: [...base, intro, hero],
  contact: [...base, intro],
  online: [{ kind: "text", name: "ctaLabel", label: "Register button label" }],
};

const titles: Record<SectionKey, string> = {
  programs: "Programmes",
  expertise: "Expertise",
  testimonials: "Testimonials",
  faq: "FAQ",
  contact: "Contact",
  online: "Online programme",
};

export default async function SectionsPage() {
  await requireAdmin();
  const rows = await getDb().select().from(sectionCopy);
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));

  return (
    <>
      <PageHeader
        title="Section copy"
        description="Headings and intros for each section of the site."
      />
      <div className="space-y-4">
        {SECTION_KEYS.map((key) => {
          const row = byKey[key];
          if (!row) return null;
          /* The online form only shows its button label, but the schema needs
             eyebrow and headline, so they travel as hidden fields. */
          const hidden: Record<string, string> =
            key === "online"
              ? { key, eyebrow: row.eyebrow, headline: row.headline }
              : { key };
          return (
            <details
              key={key}
              className="group rounded-[1.25rem] border border-line bg-coal"
              open={key === "programs"}
            >
              <summary className="cursor-pointer px-6 py-4 font-display text-2xl">
                {titles[key]}
              </summary>
              <Panel className="rounded-t-none border-0 border-t">
                <ResourceForm
                  action={saveSection}
                  fields={fieldsFor[key]}
                  hidden={hidden}
                  initial={{
                    ...row,
                    headlineAccent: row.headlineAccent ?? "",
                    intro: row.intro ?? "",
                    ctaLabel: row.ctaLabel ?? "",
                    ctaHref: row.ctaHref ?? "",
                    heroImage: row.heroImage ?? "",
                  }}
                />
              </Panel>
            </details>
          );
        })}
      </div>
    </>
  );
}

export type LegalSlug =
  | "privacy-policy"
  | "terms-and-conditions"
  | "refund-and-cancellation";

/* A clause is a plain paragraph, or a paragraph followed by lettered points */
export type Clause = string | { text: string; items: string[] };

export type LegalSection = {
  id: string;
  title: string;
  clauses: Clause[];
};

/* "numbered" labels every clause (1.1) and lettered point ((a)); "plain" keeps
   numbered headings but shows clauses as paragraphs and points as bullets. */
export type LegalLayout = "numbered" | "plain";

export type LegalDoc = {
  slug: LegalSlug;
  title: string;
  layout?: LegalLayout;
  description: string;
  intro: string[];
  sections: LegalSection[];
};

export type NumberedClause = {
  label: string;
  text: string;
  items: string[];
};

export type NumberedSection = {
  id: string;
  number: number;
  title: string;
  clauses: NumberedClause[];
};

/* Numbers sections (1, 2, 3) and, in the numbered layout, clauses (1.1, 1.2, 2.1).
   Plain-layout clauses get an empty label. */
export function numberSections(
  sections: LegalSection[],
  layout: LegalLayout = "numbered",
): NumberedSection[] {
  return sections.map((section, i) => ({
    id: section.id,
    number: i + 1,
    title: section.title,
    clauses: section.clauses.map((clause, j) => ({
      label: layout === "plain" ? "" : `${i + 1}.${j + 1}`,
      text: typeof clause === "string" ? clause : clause.text,
      items: typeof clause === "string" ? [] : clause.items,
    })),
  }));
}

export const itemLabel = (index: number, layout: LegalLayout = "numbered") =>
  layout === "plain" ? "\u2022" : `(${String.fromCharCode(97 + index)})`;
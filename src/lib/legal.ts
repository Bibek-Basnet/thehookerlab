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

export type LegalDoc = {
  slug: LegalSlug;
  title: string;
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

/* Numbers sections (1, 2, 3) and clauses (1.1, 1.2, 2.1) */
export function numberSections(sections: LegalSection[]): NumberedSection[] {
  return sections.map((section, i) => ({
    id: section.id,
    number: i + 1,
    title: section.title,
    clauses: section.clauses.map((clause, j) => ({
      label: `${i + 1}.${j + 1}`,
      text: typeof clause === "string" ? clause : clause.text,
      items: typeof clause === "string" ? [] : clause.items,
    })),
  }));
}

/* (a), (b), (c) ... */
export const itemLabel = (index: number) =>
  `(${String.fromCharCode(97 + index)})`;
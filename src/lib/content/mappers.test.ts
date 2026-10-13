import { describe, expect, it } from "vitest";
import {
  headlineLines,
  programNumber,
  toExpertiseSection,
  toFaqSection,
  toProgramsSection,
} from "@/lib/content/mappers";
import { seedSectionCopy, seedSettings } from "@/lib/content/seed-data";
import type {
  FaqRow,
  PillarRow,
  ProgramRow,
  SectionCopyRow,
  SkillRow,
} from "@/lib/db/schema";

const now = new Date();
const copy = (key: string, s = seedSectionCopy.programs): SectionCopyRow => ({
  key,
  ...s,
  updatedAt: now,
});

const program = (over: Partial<ProgramRow>): ProgramRow => ({
  id: 1,
  slug: "p",
  sortOrder: 0,
  format: "Online",
  title: "T",
  summary: "S",
  listTitle: "L",
  points: ["a"],
  imageSrc: "/i.jpg",
  imageAlt: "alt",
  price: null,
  priceNote: null,
  showPrice: false,
  published: true,
  createdAt: now,
  updatedAt: now,
  ...over,
});

describe("headlineLines", () => {
  it("splits on newlines and drops blank or trailing lines", () => {
    expect(headlineLines("Choose how\n\nyou train.\n")).toEqual([
      "Choose how",
      "you train.",
    ]);
  });

  it("trims each line", () => {
    expect(headlineLines("  A \n B ")).toEqual(["A", "B"]);
  });
});

describe("programNumber", () => {
  it("pads to two digits", () => {
    expect(programNumber(0)).toBe("01");
    expect(programNumber(11)).toBe("12");
  });
});

describe("toProgramsSection", () => {
  it("drops unpublished rows and numbers by published position", () => {
    const rows = [
      program({ id: 1, slug: "a", published: false }),
      program({ id: 2, slug: "b" }),
      program({ id: 3, slug: "c" }),
    ];
    const out = toProgramsSection(copy("programs"), rows, {
      ...seedSettings,
      updatedAt: now,
    });
    expect(out.items.map((i) => i.id)).toEqual(["b", "c"]);
    expect(out.items[0].number).toBe("01");
    expect(out.headline).toEqual(["Choose how", "you train."]);
    expect(out.cta).toEqual({ label: "Get in touch", href: "/#contact" });
  });

  it("resolves the price label through the pricing rule", () => {
    const rows = [program({ price: "90", showPrice: true })];
    const out = toProgramsSection(copy("programs"), rows, {
      ...seedSettings,
      showPricing: true,
      updatedAt: now,
    });
    expect(out.items[0].priceLabel).toBe("$90");
  });
});

describe("toExpertiseSection", () => {
  it("attaches skills to their pillar in sort order", () => {
    const pillars: PillarRow[] = [
      {
        id: 1,
        slug: "throw",
        sortOrder: 0,
        word: "Throw",
        summary: "s",
        imageSrc: "/i",
        imageAlt: "a",
        panel: true,
        published: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    const skills: SkillRow[] = [
      { id: 2, pillarId: 1, sortOrder: 1, name: "B", detail: "b" },
      { id: 1, pillarId: 1, sortOrder: 0, name: "A", detail: "a" },
      { id: 3, pillarId: 99, sortOrder: 0, name: "X", detail: "x" },
    ];
    const out = toExpertiseSection(
      copy("expertise", seedSectionCopy.expertise),
      pillars,
      skills,
    );
    expect(out.headline).toEqual({ plain: "The complete", accent: "hooker." });
    expect(out.pillars[0].skills.map((s) => s.name)).toEqual(["A", "B"]);
  });
});

describe("toFaqSection", () => {
  it("uses the row id as the item id and keeps the hero image", () => {
    const rows: FaqRow[] = [
      {
        id: 7,
        sortOrder: 0,
        question: "Q",
        answer: "A",
        published: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    const out = toFaqSection(copy("faq", seedSectionCopy.faq), rows);
    expect(out.items[0].id).toBe("7");
    expect(out.heroImage).toBe("/images/FAQ.jpeg");
  });
});

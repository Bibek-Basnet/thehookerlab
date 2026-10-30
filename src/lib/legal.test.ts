import { describe, expect, it } from "vitest";

import { legalDocuments } from "@/data/legal";
import { itemLabel, numberSections } from "@/lib/legal";

describe("numberSections", () => {
  const sections = [{ id: "a", title: "A", clauses: ["one", { text: "two", items: ["x"] }] }];

  it("labels clauses 1.1, 1.2 and points (a) in the numbered layout", () => {
    expect(numberSections(sections).map((s) => s.clauses.map((c) => c.label))).toEqual([["1.1", "1.2"]]);
    expect(itemLabel(0)).toBe("(a)");
  });

  it("keeps section numbers but drops clause labels in the plain layout", () => {
    const [s] = numberSections(sections, "plain");
    expect(s.number).toBe(1);
    expect(s.clauses.map((c) => c.label)).toEqual(["", ""]);
    expect(itemLabel(0, "plain")).toBe("•");
  });
});

describe("legal documents", () => {
  it("clause 13.2 of the Terms is the business consumer-guarantees clause the Refund policy cites", () => {
    const refund = JSON.stringify(legalDocuments["refund-and-cancellation"].sections);
    expect(refund).toContain("clause 13.2 of our Terms and Conditions");
    const [terms13] = numberSections(legalDocuments["terms-and-conditions"].sections).filter((s) => s.number === 13);
    expect(terms13.title).toBe("Consumer guarantees and our liability");
    expect(terms13.clauses[1].text).toMatch(/for the purposes of a business/);
  });
});

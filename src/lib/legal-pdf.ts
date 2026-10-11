import { jsPDF } from "jspdf";

import { legalDocuments } from "@/data/legal";
import { legal } from "@/data/legal/shared";
import { itemLabel, numberSections, type LegalSlug } from "@/lib/legal";

const PT = 0.3528; /* millimetres per point */

type Style = "normal" | "bold" | "italic";

/* Builds the PDF from the same data as the web page and downloads it */
export function downloadLegalPdf(slug: LegalSlug) {
  const doc = legalDocuments[slug];
  const sections = numberSections(doc.sections);

  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 22;
  const bottom = pageH - 24;
  const contentW = pageW - margin * 2;
  let y = margin;

  const leading = (size: number) => size * PT * 1.5;

  const setFont = (style: Style, size: number) => {
    pdf.setFont("times", style);
    pdf.setFontSize(size);
  };

  const ensure = (needed: number) => {
    if (y + needed > bottom) {
      pdf.addPage();
      y = margin;
    }
  };

  const block = (
    text: string,
    opts: { size?: number; style?: Style; after?: number } = {}
  ) => {
    const { size = 11, style = "normal", after = 3 } = opts;
    setFont(style, size);

    const lines = pdf.splitTextToSize(text, contentW) as string[];
    const h = leading(size);

    lines.forEach((line) => {
      ensure(h);
      pdf.text(line, margin, y + size * PT);
      y += h;
    });
    y += after;
  };

  const rule = (width = 0.4) => {
    pdf.setLineWidth(width);
    pdf.line(margin, y, pageW - margin, y);
  };

  const heading = (text: string) => {
    const size = 13;
    ensure(leading(size) * 4);
    y += 3;
    block(text, { size, style: "bold", after: 1.5 });
  };

  const clause = (label: string, text: string, items: string[]) => {
    const size = 11;
    const h = leading(size);
    const labelW = 13;
    const itemIndent = 9;

    setFont("normal", size);
    const lines = pdf.splitTextToSize(text, contentW - labelW) as string[];
    ensure(h * Math.min(lines.length, 2));

    setFont("bold", size);
    pdf.text(label, margin, y + size * PT);
    setFont("normal", size);

    lines.forEach((line, i) => {
      if (i > 0) ensure(h);
      pdf.text(line, margin + labelW, y + size * PT);
      y += h;
    });

    items.forEach((item, i) => {
      const itemLines = pdf.splitTextToSize(
        item,
        contentW - labelW - itemIndent
      ) as string[];
      ensure(h * Math.min(itemLines.length, 2));

      pdf.text(itemLabel(i), margin + labelW, y + size * PT);
      itemLines.forEach((line, k) => {
        if (k > 0) ensure(h);
        pdf.text(line, margin + labelW + itemIndent, y + size * PT);
        y += h;
      });
    });

    y += 2.5;
  };

  /* Title block */
  block(legal.brand.toUpperCase(), { size: 9, style: "bold", after: 3 });
  block(doc.title, { size: 24, style: "bold", after: 4 });
  block(`Effective date: ${legal.effectiveDate}`, { size: 10, after: 0 });
  block(`Last updated: ${legal.lastUpdated}`, { size: 10, after: 0 });
  block(`Provider: ${legal.operatorLine}`, { size: 10, after: 0 });
  block(`Contact: ${legal.email}`, { size: 10, after: 4 });
  rule();
  y += 7;

  doc.intro.forEach((paragraph) => block(paragraph, { after: 4 }));

  /* Contents */
  y += 3;
  block("Contents", { size: 13, style: "bold", after: 1.5 });
  sections.forEach((section) => {
    block(`${section.number}.  ${section.title}`, { size: 10.5, after: 0.6 });
  });
  y += 5;

  /* Sections */
  sections.forEach((section) => {
    heading(`${section.number}.  ${section.title}`);
    section.clauses.forEach((c) => clause(c.label, c.text, c.items));
    y += 2;
  });

  /* End of document */
  ensure(leading(11) * 3);
  y += 4;
  rule(0.4);
  y += 4;
  block(`End of ${doc.title}`, { size: 10, style: "bold", after: 0 });

  /* Footer with page numbers on every page */
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i);
    pdf.setLineWidth(0.2);
    pdf.line(margin, pageH - 17, pageW - margin, pageH - 17);
    setFont("normal", 9);
    pdf.text(`${legal.brand} - ${doc.title}`, margin, pageH - 12);
    pdf.text(`Page ${i} of ${total}`, pageW - margin, pageH - 12, {
      align: "right",
    });
  }

  pdf.setProperties({
    title: `${legal.brand} - ${doc.title}`,
    subject: doc.title,
    author: legal.brand,
  });

  pdf.save(`${legal.fileSlug}-${slug}.pdf`);
}
import type { EnquiryRow, RegistrationRow } from "@/lib/db/schema";

export type Mail = { subject: string; html: string; text: string };

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type Line = [label: string, value: string | null | undefined];

/* Plain-text and HTML bodies from the same rows. User input is escaped in HTML. */
function render(
  title: string,
  lines: Line[],
  message: { label: string; value: string | null },
  link: string,
): Mail {
  const rows = lines.filter((l): l is [string, string] => Boolean(l[1]));
  const text = [
    title,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    ...(message.value ? ["", `${message.label}:`, message.value] : []),
    "",
    `Open in admin: ${link}`,
  ].join("\n");

  const tableRows = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
    )
    .join("\n");
  const messageBlock = message.value
    ? `<p style="margin:16px 0 4px;color:#666">${escapeHtml(message.label)}</p><p style="white-space:pre-wrap;margin:0">${escapeHtml(message.value)}</p>`
    : "";
  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111;line-height:1.5">
<h2 style="margin:0 0 16px">${escapeHtml(title)}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
${tableRows}
</table>
${messageBlock}
<p style="margin-top:24px"><a href="${escapeHtml(link)}">Open in admin</a></p>
</body></html>`;

  return { subject: title, html, text };
}

export function enquiryNotification(row: EnquiryRow, siteUrl: string): Mail {
  return render(
    `New enquiry from ${row.name} (${row.enquiryType})`,
    [
      ["Name", row.name],
      ["Email", row.email],
      ["Role", row.role],
      ["Organisation", row.organisation],
      ["Preferred contact", row.contactMethod],
      ["Phone", row.phone],
      ["Age group", row.ageGroup],
      ["Level", row.level],
      ["Group size", row.groupSize],
      ["Location", row.location],
      ["Timing", row.timing],
      ["Workshop topics", row.workshopTopics.length ? row.workshopTopics.join(", ") : null],
      ["Sent from", row.sourcePage],
      ["Submitted", row.submittedAt.toISOString()],
    ],
    { label: "Message", value: row.message },
    `${siteUrl}/admin/enquiries/${row.id}`,
  );
}

export function registrationNotification(
  row: RegistrationRow,
  siteUrl: string,
): Mail {
  return render(
    `New online programme registration from ${row.name}`,
    [
      ["Name", row.name],
      ["Email", row.email],
      ["Phone", row.phone],
      ["Location", row.location],
      ["Registering as", row.role],
      ["Level", row.level],
      ["Hooker experience", row.experience],
      ["Focus areas", row.focusAreas.length ? row.focusAreas.join(", ") : null],
      ["Submitted", row.acceptedAt.toISOString()],
    ],
    { label: "Main goal", value: row.goal },
    `${siteUrl}/admin/registrations/${row.id}`,
  );
}

import type { Partner } from "./types";

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/** Pulls the sender address out of a pasted email ("From: Jane <jane@acme.com>"). */
export function extractSender(raw: string): string {
  const lines = raw.split(/\r?\n/).slice(0, 40);
  for (const line of lines) {
    if (/^\s*(from|từ)\s*:/i.test(line)) {
      const m = line.match(EMAIL_RE);
      if (m) return m[0].toLowerCase();
    }
  }
  // Gmail's copied header: "Jane Doe <jane@acme.com>" on its own line near the top.
  for (const line of lines.slice(0, 5)) {
    const m = line.match(/<([^>]+@[^>]+)>/);
    if (m && EMAIL_RE.test(m[1])) return m[1].trim().toLowerCase();
  }
  return "";
}

/**
 * Finds the partner for a sender. An exact address beats a domain entry ("@acme.com" or "acme.com"),
 * so one contact can have their own profile inside a company that also has a general one.
 */
export function matchPartner(sender: string, partners: Partner[]): Partner | null {
  const email = sender.trim().toLowerCase();
  if (!email.includes("@")) return null;
  const domain = email.split("@")[1];

  const exact = partners.find((p) => p.emails.some((e) => e.trim().toLowerCase() === email));
  if (exact) return exact;

  return (
    partners.find((p) =>
      p.emails.some((e) => {
        const entry = e.trim().toLowerCase();
        if (entry.includes("@") && !entry.startsWith("@")) return false;
        return entry.replace(/^@/, "") === domain;
      }),
    ) ?? null
  );
}

/** "a@x.com, @y.com\n b@z.com" → ["a@x.com", "@y.com", "b@z.com"] */
export function parseEmailList(input: string): string[] {
  return [...new Set(input.split(/[\s,;]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))];
}

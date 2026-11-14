import { describe, expect, it } from "vitest";
import { buildUserMessage, SYSTEM_PROMPT } from "./prompt";
import { defaultLibrary } from "./store";
import { DraftRequestSchema, type DraftRequest } from "./types";
import { blankPartnerForTest } from "./test-helpers";

function req(over: Partial<DraftRequest> = {}): DraftRequest {
  const lib = defaultLibrary();
  return DraftRequestSchema.parse({
    incoming: "Hi, what's your price for 200 roses?",
    myPoints: "",
    language: "English",
    length: "medium",
    partner: null,
    scenario: null,
    style: { ...lib.style, myName: "Ngan", signature: "Best,\nNgan" },
    ...over,
  });
}

describe("buildUserMessage", () => {
  it("includes the email, the sender's signature and the output settings", () => {
    const msg = buildUserMessage(req());
    expect(msg).toContain("200 roses");
    expect(msg).toContain("Best,\nNgan");
    expect(msg).toContain("Language: English");
    expect(msg).toContain("Unknown sender");
  });

  it("passes the partner's history so agreed prices are reused, not invented", () => {
    const partner = blankPartnerForTest({ name: "Jane", history: "Agreed 15,000 VND per stem", formality: "formal" });
    const msg = buildUserMessage(req({ partner }));
    expect(msg).toContain("Agreed 15,000 VND per stem");
    expect(msg).toContain("Formality: formal");
    expect(msg).not.toContain("Unknown sender");
  });

  it("includes the scenario and skips empty fields", () => {
    const scenario = defaultLibrary().scenarios[0];
    const msg = buildUserMessage(req({ scenario }));
    expect(msg).toContain(scenario.name);
    expect(msg).not.toContain("Example of a good reply");
  });

  it("switches to rewrite mode when a previous draft is given", () => {
    const msg = buildUserMessage(req({ previousDraft: "Dear Jane, ...", revision: "shorter" }));
    expect(msg).toContain("<previous_draft>");
    expect(msg).toContain("shorter");
    expect(msg).not.toMatch(/Write the reply\.$/);
  });

  it("keeps the system prompt free of per-request data so it can be cached", () => {
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(SYSTEM_PROMPT).toContain("Never invent facts");
  });
});

it("rejects an empty email", () => {
  expect(DraftRequestSchema.safeParse({ ...req(), incoming: "   " }).success).toBe(false);
});

import { describe, expect, it } from "vitest";
import { buildUserMessage, SYSTEM_PROMPT } from "./prompt";
import { DEFAULT_SETTINGS, parseSettings } from "./store";
import { WriteRequestSchema, type WriteRequest } from "./types";

function req(over: Partial<WriteRequest> = {}): WriteRequest {
  return WriteRequestSchema.parse({
    text: "Chào chị, bên em giao 200 cành hồng vào thứ Hai.",
    kind: "email",
    mode: "translate",
    tone: "polite",
    settings: { ...DEFAULT_SETTINGS, signature: "Best,\nNgan" },
    ...over,
  });
}

describe("buildUserMessage", () => {
  it("carries the text, settings and glossary", () => {
    const msg = buildUserMessage(req());
    expect(msg).toContain("200 cành hồng");
    expect(msg).toContain("Kind: email");
    expect(msg).toContain("Tone: polite");
    expect(msg).toContain("cành = stem");
    expect(msg).toContain("Best,\nNgan");
  });

  it("leaves the signature out of messages and documents", () => {
    expect(buildUserMessage(req({ kind: "message" }))).not.toContain("<signature>");
    expect(buildUserMessage(req({ kind: "document" }))).not.toContain("<signature>");
  });

  it("omits empty optional sections", () => {
    const msg = buildUserMessage(req({ context: "  ", settings: { signature: "", glossary: "", rules: "" } }));
    expect(msg).not.toContain("<context>");
    expect(msg).not.toContain("<glossary>");
    expect(msg).not.toContain("<author_rules>");
  });

  it("switches to revision mode with the previous English", () => {
    const msg = buildUserMessage(req({ previous: "Hi Lan, ...", revision: "more formal" }));
    expect(msg).toContain("<previous_english>");
    expect(msg).toContain("more formal");
    expect(msg).not.toContain("Write the English.");
  });

  it("keeps the system prompt fixed so it can be cached", () => {
    expect(SYSTEM_PROMPT).toContain("Keep the meaning");
    expect(SYSTEM_PROMPT).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

describe("validation", () => {
  it("rejects empty text", () => {
    expect(WriteRequestSchema.safeParse({ ...req(), text: "  " }).success).toBe(false);
  });
  it("rejects an unknown kind", () => {
    expect(WriteRequestSchema.safeParse({ ...req(), kind: "poem" }).success).toBe(false);
  });
});

describe("parseSettings", () => {
  it("falls back to defaults on missing or broken data", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("{oops")).toEqual(DEFAULT_SETTINGS);
  });
  it("reads saved settings and fills missing fields", () => {
    expect(parseSettings(JSON.stringify({ signature: "Ngan" }))).toEqual({ signature: "Ngan", glossary: "", rules: "" });
  });
});

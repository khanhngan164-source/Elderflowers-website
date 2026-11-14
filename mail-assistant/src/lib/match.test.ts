import { describe, expect, it } from "vitest";
import { extractSender, matchPartner, parseEmailList } from "./match";
import { blankPartnerForTest } from "./test-helpers";

describe("extractSender", () => {
  it("reads the From line", () => {
    expect(extractSender("From: Jane Doe <Jane@Acme.com>\nSubject: hi\n\nBody")).toBe("jane@acme.com");
  });
  it("reads a Vietnamese Gmail header", () => {
    expect(extractSender("Từ: Lan <lan@ncc.vn>\nNgày: ...")).toBe("lan@ncc.vn");
  });
  it("falls back to an <address> near the top", () => {
    expect(extractSender("Jane Doe <jane@acme.com>\n10:02 AM\n\nHello")).toBe("jane@acme.com");
  });
  it("ignores addresses deep in the body", () => {
    const body = Array(10).fill("text").join("\n") + "\ncontact <x@y.com>";
    expect(extractSender(body)).toBe("");
  });
});

describe("matchPartner", () => {
  const company = blankPartnerForTest({ id: "co", emails: ["@acme.com"] });
  const jane = blankPartnerForTest({ id: "jane", emails: ["jane@acme.com"] });
  const other = blankPartnerForTest({ id: "other", emails: ["bob@acme.com"] });

  it("prefers the exact address over the company domain", () => {
    expect(matchPartner("jane@acme.com", [company, jane])?.id).toBe("jane");
  });
  it("falls back to the domain", () => {
    expect(matchPartner("tom@acme.com", [company, jane])?.id).toBe("co");
  });
  it("accepts domains written without @", () => {
    expect(matchPartner("a@b.vn", [blankPartnerForTest({ id: "b", emails: ["b.vn"] })])?.id).toBe("b");
  });
  it("does not treat another person's address as a domain", () => {
    expect(matchPartner("tom@acme.com", [other])).toBeNull();
  });
  it("returns null for no sender", () => {
    expect(matchPartner("", [company])).toBeNull();
  });
});

it("parseEmailList splits, lowercases and dedupes", () => {
  expect(parseEmailList("A@x.com, @Y.com;\n a@x.com")).toEqual(["a@x.com", "@y.com"]);
});

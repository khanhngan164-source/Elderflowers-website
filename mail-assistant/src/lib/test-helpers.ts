import type { Partner } from "./types";

export function blankPartnerForTest(over: Partial<Partner>): Partner {
  return {
    id: "p",
    name: "Test",
    emails: [],
    company: "",
    type: "customer",
    formality: "neutral",
    language: "English",
    notes: "",
    history: "",
    ...over,
  };
}

import { describe, expect, it } from "vitest";
import { serifText } from "./ui";

describe("serifText", () => {
  it("switches to the Vietnamese serif only when Instrument Serif lacks a glyph", () => {
    expect(serifText("Mùa hoa cơm cháy", "t")).toEqual({ lang: "vi", className: "t serif-vi" });
    expect(serifText("Đặt hàng").className).toBe("serif-vi");
    expect(serifText("Bánh mì", "t")).toEqual({ className: "t" }); // á, ì exist in Instrument Serif
    expect(serifText("Elderflower Cordial", "t")).toEqual({ className: "t" });
  });
});

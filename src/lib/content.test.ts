import { describe, expect, it } from "vitest";
import schema from "../../cms/schema.json";
import { DEFAULT_CONTENT, imageUrl, parseCategory, parseContent, parseMonths, toPrice } from "./content";
import { seasonStatus } from "./logic";

const P = schema.tabs.products.columns;

describe("sheet value parsing", () => {
  it("reads prices the way people type them", () => {
    expect([toPrice("220.000"), toPrice("220,000₫"), toPrice(" 1.200.000 đ"), toPrice("")]).toEqual([220000, 220000, 1200000, 0]);
  });
  it("reads 1-based months and 'quanh năm'", () => {
    expect(parseMonths("10, 11,12,1,2")).toEqual([9, 10, 11, 0, 1]);
    expect(parseMonths("Quanh năm")).toHaveLength(12);
    expect(parseMonths("13, abc")).toEqual([]);
  });
  it("maps Vietnamese category names", () => {
    expect(["Siro", "Hoa tươi", "Nến thơm", "Tắm gội"].map(parseCategory)).toEqual(["cordial", "flowers", "candle", "bath"]);
  });
  it("turns Drive share links into direct image URLs and drops non-https values", () => {
    expect(imageUrl("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view?usp=sharing")).toBe("https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOpQrStUv=w2000");
    expect(imageUrl("https://drive.google.com/open?id=1AbCdEfGhIjKlMnOpQrStUv")).toBe("https://lh3.googleusercontent.com/d/1AbCdEfGhIjKlMnOpQrStUv=w2000");
    expect(imageUrl("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
    expect(imageUrl("javascript:alert(1)")).toBe("");
  });
  it("shows no season label for an ingredient with no months", () => {
    expect(seasonStatus({ months: [] }, 3).label).toBe("");
  });
});

describe("parseContent", () => {
  it("uses sheet rows, skipping hidden and incomplete products", () => {
    const c = parseContent({
      settings: { hero_title: "Mùa hoa mới", delivery_fee: "", hero_image: "https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view" },
      tabs: {
        [schema.tabs.products.sheet]: [
          { [P.id]: "elder", [P.category]: "Siro", [P.name]: "Elderflower Cordial", [P.price]: "250.000", [P.ings]: "elder, lemon" },
          { [P.id]: "gone", [P.name]: "Old", [P.price]: "100000", [P.visible]: "Không" },
          { [P.id]: "noprice", [P.name]: "Draft" },
        ],
      },
    });
    expect(c.products.map((p) => [p.id, p.price, p.ings])).toEqual([["elder", 250000, ["elder", "lemon"]]]);
    expect(c.settings.hero_title).toBe("Mùa hoa mới");
    expect(c.settings.delivery_fee).toBe("35000"); // blank cell keeps the default
    expect(c.settings.hero_image).toMatch(/^https:\/\/lh3\.googleusercontent\.com\/d\//);
    expect(c.ingredients).toBe(DEFAULT_CONTENT.ingredients); // missing tab → defaults
  });
  it("never exposes private settings even if they are sent", () => {
    expect(parseContent({ settings: { order_email: "x@y.z" }, tabs: {} }).settings).not.toHaveProperty("order_email");
  });
});

describe("priceOf", () => {
  it("prices products and boxes, and returns null for things no longer sold", async () => {
    const { priceOf, boxKey } = await import("./content");
    expect(priceOf("elder", DEFAULT_CONTENT)).toBe(220000);
    expect(priceOf(boxKey("Garden", 0), DEFAULT_CONTENT)).toBe(650000);
    expect(priceOf("box-1-0", DEFAULT_CONTENT)).toBeNull();
    expect(priceOf(boxKey("Garden", 7), DEFAULT_CONTENT)).toBeNull();
  });
});

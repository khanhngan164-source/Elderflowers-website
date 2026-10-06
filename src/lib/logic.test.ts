import { describe, expect, it } from "vitest";
import { addToBag, bagTotals, changeQty, formatVnd, seasonStatus, upcomingVisitDays, validateCheckout, type BagItem } from "./logic";

const item = (key: string, price: number): Omit<BagItem, "qty"> => ({ key, name: key, sizeLabel: "", price, swatch: ["#000", "#000"] });

describe("bag", () => {
  it("merges repeated adds into one line", () => {
    const bag = addToBag(addToBag([], item("a", 100)), item("a", 100));
    expect(bag).toHaveLength(1);
    expect(bag[0].qty).toBe(2);
  });

  it("removes a line when its quantity reaches 0", () => {
    expect(changeQty(addToBag([], item("a", 100)), "a", -1)).toEqual([]);
  });

  it("charges delivery below 1.000.000₫ and drops it at the threshold", () => {
    const under = bagTotals([{ ...item("a", 900000), qty: 1 }], false);
    expect(under.delivery).toBe(35000);
    expect(under.untilFree).toBe(100000);
    expect(bagTotals([{ ...item("a", 500000), qty: 2 }], false).delivery).toBe(0);
  });

  it("does not count gift wrap toward free delivery, and skips it on an empty bag", () => {
    const t = bagTotals([{ ...item("a", 980000), qty: 1 }], true);
    expect(t).toMatchObject({ wrapFee: 30000, delivery: 35000, total: 1045000 });
    expect(bagTotals([], true).total).toBe(0);
  });
});

describe("formatVnd", () => {
  it("uses Vietnamese thousands separators", () => {
    expect(formatVnd(220000)).toBe("220.000₫");
  });
});

describe("seasonStatus", () => {
  const elder = { months: [9, 10, 11, 0, 1] };
  it("reports picking, last weeks, all year and next start", () => {
    expect(seasonStatus(elder, 10).label).toBe("Picking now · Đang mùa");
    expect(seasonStatus(elder, 1).label).toBe("Last weeks · Cuối mùa");
    expect(seasonStatus({ months: [...Array(12).keys()] }, 3).label).toBe("All year · Quanh năm");
    expect(seasonStatus(elder, 5)).toEqual({ inSeason: false, label: "From Oct" });
    expect(seasonStatus({ months: [2, 3] }, 11).label).toBe("From Mar");
  });
});

describe("upcomingVisitDays", () => {
  it("returns only Fri/Sat/Sun after the given day", () => {
    const days = upcomingVisitDays(new Date(2026, 9, 6)); // Tue 6 Oct 2026
    expect(days.map((d) => `${d.weekday} ${d.day}`)).toEqual(["Fri 9", "Sat 10", "Sun 11", "Fri 16", "Sat 17", "Sun 18"]);
  });
});

describe("validateCheckout", () => {
  it("accepts a valid form, including a phone with spaces", () => {
    expect(validateCheckout({ name: "Thu Hà", phone: "0901 234 567", address: "12 Nguyễn Văn Trỗi" })).toEqual({});
  });
  it("flags each invalid field", () => {
    expect(Object.keys(validateCheckout({ name: "H", phone: "901234567", address: "Q1" }))).toEqual(["name", "phone", "address"]);
  });
});

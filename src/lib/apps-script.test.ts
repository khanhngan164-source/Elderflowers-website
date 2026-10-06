// Runs the pure functions of cms/apps-script/Code.gs in Node. Google services are never touched.
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import schema from "../../cms/schema.json";

const code = readFileSync(path.resolve(__dirname, "../../cms/apps-script/Code.gs"), "utf8");
const gs = vm.runInNewContext(code + "\n;({ computeOrder, computeBooking, validEmail, driveFileId, publicContent_, COL, RECORDS, CONTENT_SHEETS, SETTINGS_SHEET, PRIVATE_SETTINGS, UserError })", {});

const P = schema.tabs.products.columns;
const B = schema.tabs.box.columns;
const E = schema.tabs.experiences.columns;

const content = {
  settings: { delivery_fee: "35.000", free_delivery_from: "1.000.000", wrap_fee: "30000", bank_id: "VCB", bank_account: "0123456789", order_email: "shop@example.com" },
  tabs: {
    SanPham: [
      { [P.id]: "elder", [P.name]: "Elderflower Cordial", [P.price]: "220.000", [P.size]: "250ml", [P.visible]: "Có" },
      { [P.id]: "old", [P.name]: "Retired", [P.price]: "100000", [P.visible]: "Không" },
    ],
    HopHoa: [{ [B.name]: "Garden", [B.price]: "650000" }],
    TraiNghiem: [{ [E.name]: "Cordial workshop", [E.price]: "850.000" }],
  },
};
const contact = { name: "Thu Hà", phone: "0901 234 567", address: "12 Nguyễn Văn Trỗi, Phú Nhuận" };
const errorOf = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as Error).message;
  }
  return null;
};

describe("Apps Script ↔ schema", () => {
  it("uses the same tab and column names as cms/schema.json", () => {
    expect(gs.SETTINGS_SHEET).toBe(schema.settingsSheet);
    expect([...gs.PRIVATE_SETTINGS]).toEqual(schema.privateSettings);
    expect([...gs.CONTENT_SHEETS].sort()).toEqual(Object.values(schema.tabs).map((t) => t.sheet).sort());
    expect(gs.COL).toMatchObject({ productId: P.id, productName: P.name, productPrice: P.price, productVisible: P.visible, productSize: P.size, boxName: B.name, boxPrice: B.price, expName: E.name, expPrice: E.price });
    for (const [k, rec] of Object.entries(schema.records)) expect(JSON.parse(JSON.stringify(gs.RECORDS[k]))).toEqual(rec);
  });
});

describe("computeOrder", () => {
  it("prices from the sheet and ignores totals sent by the browser", () => {
    const o = gs.computeOrder(content, { ...contact, items: [{ key: "elder", qty: 2, price: 1 }], total: 1, wrap: true, wrapNote: "Gửi mẹ", pay: "transfer" });
    expect(o).toMatchObject({ subtotal: 440000, delivery: 35000, wrapFee: 30000, total: 505000, pay: "Chuyển khoản", note: "Gửi mẹ", phone: "0901234567" });
  });

  it("prices flower boxes by name and frequency, with free delivery over the threshold", () => {
    const o = gs.computeOrder(content, { ...contact, items: [{ key: "box:Garden:1", qty: 2 }] });
    expect(o.lines[0].label).toBe("Garden Flower Box (Fortnightly)");
    expect(o).toMatchObject({ subtotal: 1300000, delivery: 0, total: 1300000, pay: "COD" });
  });

  it("rejects hidden or unknown products, bad quantities and bad contact details", () => {
    expect(errorOf(() => gs.computeOrder(content, { ...contact, items: [{ key: "old", qty: 1 }] }))).toMatch(/không còn bán/);
    expect(errorOf(() => gs.computeOrder(content, { ...contact, items: [{ key: "nope", qty: 1 }] }))).toMatch(/không còn bán/);
    expect(errorOf(() => gs.computeOrder(content, { ...contact, items: [{ key: "elder", qty: 50 }] }))).toMatch(/Số lượng/);
    expect(errorOf(() => gs.computeOrder(content, { ...contact, items: [{ key: "elder", qty: -1 }] }))).toMatch(/Số lượng/);
    expect(errorOf(() => gs.computeOrder(content, { ...contact, items: [] }))).toMatch(/trống/);
    expect(errorOf(() => gs.computeOrder(content, { ...contact, phone: "123", items: [{ key: "elder", qty: 1 }] }))).toMatch(/điện thoại/);
    expect(errorOf(() => gs.computeOrder(content, { ...contact, address: "Q1", items: [{ key: "elder", qty: 1 }] }))).toMatch(/địa chỉ/);
  });

  it("falls back to COD when no bank account is configured", () => {
    const noBank = { ...content, settings: { ...content.settings, bank_account: "" } };
    expect(gs.computeOrder(noBank, { ...contact, items: [{ key: "elder", qty: 1 }], pay: "transfer" }).pay).toBe("COD");
  });
});

describe("computeBooking", () => {
  const today = new Date(2026, 9, 6); // Tue 6 Oct 2026
  it("accepts an upcoming Fri–Sun date and prices per guest", () => {
    expect(gs.computeBooking(content, { ...contact, experience: "Cordial workshop", date: "2026-10-10", guests: 3 }, today)).toMatchObject({ date: "10/10/2026", total: 2550000 });
  });
  it("rejects weekdays, past dates and too many guests", () => {
    expect(errorOf(() => gs.computeBooking(content, { ...contact, experience: "Cordial workshop", date: "2026-10-07", guests: 2 }, today))).toMatch(/thứ Sáu/);
    expect(errorOf(() => gs.computeBooking(content, { ...contact, experience: "Cordial workshop", date: "2026-10-04", guests: 2 }, today))).toMatch(/sắp tới/);
    expect(errorOf(() => gs.computeBooking(content, { ...contact, experience: "Cordial workshop", date: "2026-10-10", guests: 20 }, today))).toMatch(/Số khách/);
  });
});

describe("helpers", () => {
  it("keeps private settings such as the order email out of public content", () => {
    expect(gs.publicContent_(content).settings).not.toHaveProperty("order_email");
  });
  it("validates newsletter emails and extracts Drive file ids", () => {
    expect(gs.validEmail(" Ha@Example.com ")).toBe("ha@example.com");
    expect(errorOf(() => gs.validEmail("nope"))).toMatch(/Email/);
    expect(gs.driveFileId("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUv/view?usp=sharing")).toBe("1AbCdEfGhIjKlMnOpQrStUv");
  });
});

// Pure business rules shared by the UI. Kept free of React so they can be unit-tested.
import { MONTHS_SHORT, WEEKDAYS_SHORT, type Ingredient, type Swatch } from "./data";

export type Fees = { delivery: number; freeFrom: number; wrap: number };
export const DEFAULT_FEES: Fees = { delivery: 35000, freeFrom: 1000000, wrap: 30000 };
export const WRAP_NOTE_MAX = 160;
export const MAX_QTY = 9;

export const formatVnd = (v: number) => v.toLocaleString("vi-VN") + "₫";

export type BagItem = {
  key: string;
  name: string;
  sizeLabel: string;
  price: number;
  qty: number;
  swatch: Swatch;
};

export function addToBag(bag: BagItem[], item: Omit<BagItem, "qty">): BagItem[] {
  const i = bag.findIndex((b) => b.key === item.key);
  if (i < 0) return [...bag, { ...item, qty: 1 }];
  return bag.map((b, j) => (j === i ? { ...b, qty: Math.min(MAX_QTY, b.qty + 1) } : b));
}

/** Change a line's quantity by `delta`; a line that reaches 0 is removed. */
export function changeQty(bag: BagItem[], key: string, delta: number): BagItem[] {
  return bag
    .map((b) => (b.key === key ? { ...b, qty: Math.min(MAX_QTY, b.qty + delta) } : b))
    .filter((b) => b.qty > 0);
}

export function bagTotals(bag: BagItem[], wrap: boolean, fees: Fees = DEFAULT_FEES) {
  const count = bag.reduce((a, b) => a + b.qty, 0);
  const subtotal = bag.reduce((a, b) => a + b.price * b.qty, 0);
  const wrapFee = wrap && subtotal > 0 ? fees.wrap : 0;
  // Threshold is measured on the goods subtotal, before gift wrap.
  const delivery = subtotal === 0 || subtotal >= fees.freeFrom ? 0 : fees.delivery;
  const untilFree = delivery === 0 ? 0 : fees.freeFrom - subtotal;
  return { count, subtotal, wrapFee, delivery, untilFree, total: subtotal + wrapFee + delivery };
}

export function seasonStatus(g: Pick<Ingredient, "months">, month: number) {
  const inSeason = g.months.includes(month);
  if (g.months.length === 0) return { inSeason, label: "" };
  if (!inSeason) {
    const next = g.months.find((m) => m > month) ?? Math.min(...g.months);
    return { inSeason, label: "From " + MONTHS_SHORT[next] };
  }
  if (g.months.length === 12) return { inSeason, label: "All year · Quanh năm" };
  if (g.months.includes((month + 1) % 12)) return { inSeason, label: "Picking now · Đang mùa" };
  return { inSeason, label: "Last weeks · Cuối mùa" };
}

/** The next `count` Fridays, Saturdays and Sundays after `from` (the farm opens Fri–Sun). */
export function upcomingVisitDays(from: Date, count = 6) {
  const days: { key: string; iso: string; weekday: string; day: number; month: string }[] = [];
  for (let i = 1; days.length < count && i < 40; i++) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i);
    if ([0, 5, 6].includes(d.getDay())) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({ key: iso, iso, weekday: WEEKDAYS_SHORT[d.getDay()], day: d.getDate(), month: MONTHS_SHORT[d.getMonth()] });
    }
  }
  return days;
}

export type CheckoutForm = { name: string; phone: string; address: string };
export type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;

export function validateContact(f: Pick<CheckoutForm, "name" | "phone">): CheckoutErrors {
  const e: CheckoutErrors = {};
  if (f.name.trim().length < 2) e.name = "Please add a name · Vui lòng nhập họ tên.";
  if (!/^0\d{9}$/.test(f.phone.replace(/\s/g, ""))) e.phone = "10 digits, e.g. 0901 234 567 · Số điện thoại chưa đúng.";
  return e;
}

export function validateCheckout(f: CheckoutForm): CheckoutErrors {
  const e = validateContact(f);
  if (f.address.trim().length < 8) e.address = "Street, ward & district · Vui lòng nhập địa chỉ.";
  return e;
}

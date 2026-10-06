// Site content: typed shape, defaults, and parsing of the Google Sheet the client edits.
// The sheet's tab and column names live in cms/schema.json, shared with the Apps Script
// (cms/apps-script/Code.gs) and the template generator (cms/build-template.ts).
import schema from "../../cms/schema.json";
import {
  BOX_SIZES,
  EXPERIENCES,
  INGREDIENTS,
  PRODUCTS,
  RECIPES,
  STORY_BLOCKS,
  type CategoryId,
  type Swatch,
} from "./data";

export type Product = {
  id: string;
  cat: CategoryId;
  name: string;
  vi: string;
  price: number;
  size: string;
  note: string;
  ings: string[];
  image: string;
  photo: string;
  swatch: Swatch;
};
export type Ingredient = { id: string; name: string; vi: string; where: string; months: number[]; story: string; image: string; photo: string; swatch: Swatch };
export type StoryBlock = { kicker: string; text: string; ing: string };
export type Recipe = { name: string; vi: string; time: string; method: string; productId: string; image: string; photo: string; swatch: Swatch };
export type BoxSize = { name: string; stems: string; price: number };
export type Experience = { name: string; vi: string; duration: string; desc: string; price: number };

/** Editable settings: key, default value, and the note shown next to it in the sheet. */
export const SETTINGS = [
  ["announcement_en", "Free delivery in Saigon & Đà Lạt over 1.000.000₫", "Thanh thông báo trên cùng (tiếng Anh)"],
  ["announcement_vi", "Miễn phí giao hàng cho đơn từ 1 triệu", "Thanh thông báo trên cùng (tiếng Việt)"],
  ["issue", "Issue No. 14 · Số 14", "Dòng nhỏ đầu trang, bên trái"],
  ["location", "Madagui, Lâm Đồng · 1,000m", "Dòng nhỏ đầu trang, bên phải"],
  ["hero_title", "The Elderflower Issue", "Tiêu đề lớn đầu trang"],
  ["hero_vi", "Số đặc biệt: Hoa cơm cháy", "Dòng tiếng Việt dưới tiêu đề lớn"],
  ["hero_dek", "Cordials, flowers and herbal goods from a hill once planted with coffee — picked before the sun burns the mist off, bottled and poured by hand.", "Đoạn mô tả đầu trang"],
  ["hero_image", "", "Ảnh lớn đầu trang (link Google Drive). Tỉ lệ ngang 5:4"],
  ["hero_caption", "Elderflower heads at dawn, Madagui", "Mô tả ảnh đầu trang (cho người khiếm thị)"],
  ["story_title", "Why we pick before the sun.", "Tiêu đề phần Câu chuyện"],
  ["story_vi", "Vì sao chúng tôi hái hoa trước bình minh.", "Dòng tiếng Việt phần Câu chuyện"],
  ["box_title", "A box of the hillside, delivered every week.", "Tiêu đề phần Hộp hoa"],
  ["box_copy", "Cut the morning of delivery from Madagui and our Đà Lạt growers. Pause or skip any time.", "Mô tả phần Hộp hoa"],
  ["box_image", "", "Ảnh Hộp hoa (link Google Drive). Ảnh vuông 1:1"],
  ["visit_title", "Come up for the weekend. Bring a basket.", "Tiêu đề phần Ghé vườn"],
  ["visit_copy", "Km 152, QL20 · Madagui, Lâm Đồng — about 2½ hours from Saigon. Open Friday to Sunday.", "Địa chỉ & giờ mở cửa"],
  ["visit_image", "", "Ảnh phần Ghé vườn (link Google Drive). Tỉ lệ ngang 16:10"],
  ["footer_tagline", "Grown in Madagui · Bottled in Saigon", "Dòng chữ dưới logo ở cuối trang"],
  ["delivery_fee", "35000", "Phí giao hàng (₫)"],
  ["free_delivery_from", "1000000", "Đơn từ mức này (₫) được miễn phí giao"],
  ["wrap_fee", "30000", "Phí gói quà (₫)"],
  ["bank_id", "", "Mã ngân hàng cho mã QR chuyển khoản, VD: VCB, TCB, MB, ACB. Để trống = tắt chuyển khoản"],
  ["bank_account", "", "Số tài khoản nhận tiền"],
  ["bank_name", "", "Tên chủ tài khoản (VIẾT HOA, không dấu)"],
  ["order_email", "elderflowersgarden@gmail.com", "Email nhận thông báo đơn hàng (không hiện trên web)"],
] as const;

export type SettingKey = (typeof SETTINGS)[number][0];
export type Settings = Record<SettingKey, string>;

export type SiteContent = {
  settings: Settings;
  products: Product[];
  ingredients: Ingredient[];
  story: StoryBlock[];
  recipes: Recipe[];
  box: BoxSize[];
  experiences: Experience[];
};

const PUBLIC_DEFAULT_SETTINGS = Object.fromEntries(
  SETTINGS.filter(([k]) => !schema.privateSettings.includes(k)).map(([k, v]) => [k, v]),
) as Settings;

export const DEFAULT_CONTENT: SiteContent = {
  settings: PUBLIC_DEFAULT_SETTINGS,
  products: PRODUCTS.map((p) => ({ ...p, image: "" })),
  ingredients: INGREDIENTS.map((g) => ({ ...g, image: "" })),
  story: STORY_BLOCKS,
  recipes: RECIPES.map((r) => ({ ...r, image: "" })),
  box: BOX_SIZES,
  experiences: EXPERIENCES,
};

// ---------- Parsing what the Apps Script returns ----------

export type RawContent = { settings: Record<string, string>; tabs: Record<string, Record<string, string>[]> };

const SOFT_SWATCHES: Swatch[] = [["#EDE4C4", "#E3D8B0"], ["#D3E0C9", "#C4D4B8"], ["#EFE9DA", "#E4DCC8"], ["#E8CF9A", "#DEC283"], ["#DCE2C4", "#CFD7B3"], ["#EFE6A8", "#E6DB92"]];
const pickSwatch = (id: string, known: { id: string; swatch: Swatch }[], i: number) => known.find((k) => k.id === id)?.swatch ?? SOFT_SWATCHES[i % SOFT_SWATCHES.length];

const str = (v: unknown) => (v == null ? "" : String(v).trim());
/** "220.000", "220,000₫", 220000 → 220000. */
export const toPrice = (v: unknown) => Number(str(v).replace(/[^\d]/g, "")) || 0;
const list = (v: unknown) => str(v).split(/[,;]/).map((s) => s.trim()).filter(Boolean);
/**
 * Google Drive share links ("drive.google.com/file/d/ID/view", "open?id=ID") → a direct image URL.
 * Other https links pass through unchanged. The Apps Script also makes Drive files link-viewable.
 */
export function imageUrl(v: unknown): string {
  const s = str(v);
  const id = s.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]{20,})/)?.[1];
  if (id) return `https://lh3.googleusercontent.com/d/${id}=w2000`;
  return /^https:\/\//.test(s) ? s : "";
}
const isHidden = (v: unknown) => /^(không|khong|no|false|ẩn|an|0)$/i.test(str(v));

/** "10,11,12,1,2" (1-based, as people write months) or "quanh năm" → [9,10,11,0,1]. */
export function parseMonths(v: unknown): number[] {
  const s = str(v).toLowerCase();
  if (/quanh|all|cả năm|ca nam/.test(s)) return [...Array(12).keys()];
  const months = list(s).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 12).map((n) => n - 1);
  return [...new Set(months)];
}

export function parseCategory(v: unknown): CategoryId {
  const s = str(v).toLowerCase();
  if (/hoa|flower|box/.test(s)) return "flowers";
  if (/nến|nen|candle/.test(s)) return "candle";
  if (/tắm|tam|gội|goi|bath|soap|xà|shampoo/.test(s)) return "bath";
  return "cordial";
}

type Tabs = typeof schema.tabs;
function rows<T extends keyof Tabs>(raw: RawContent, tab: T): Record<keyof Tabs[T]["columns"], string>[] | null {
  const { sheet, columns } = schema.tabs[tab];
  const data = raw.tabs?.[sheet];
  if (!Array.isArray(data)) return null;
  return data.map((r) => Object.fromEntries(Object.entries(columns).map(([field, header]) => [field, str(r[header])])) as Record<keyof Tabs[T]["columns"], string>);
}

/**
 * Turn the sheet's rows into SiteContent. Each section falls back to the defaults when its tab is
 * missing, so a renamed or deleted tab degrades one section instead of breaking the site.
 */
export function parseContent(raw: RawContent): SiteContent {
  const d = DEFAULT_CONTENT;
  const settings = { ...d.settings };
  for (const [k, v] of Object.entries(raw.settings ?? {})) {
    if (k in settings && str(v) !== "") settings[k as SettingKey] = str(v);
    // Images may be intentionally cleared back to the placeholder.
    if (k.endsWith("_image") && k in settings) settings[k as SettingKey] = imageUrl(v);
  }

  const ingRows = rows(raw, "ingredients");
  const ingredients = ingRows
    ? ingRows.filter((r) => r.id && r.name).map((r, i) => ({ id: r.id, name: r.name, vi: r.vi, where: r.where, months: parseMonths(r.months), story: r.story, image: imageUrl(r.image), photo: r.photo || r.name, swatch: pickSwatch(r.id, d.ingredients, i) }))
    : d.ingredients;

  const prodRows = rows(raw, "products");
  const products = prodRows
    ? prodRows.filter((r) => r.id && r.name && toPrice(r.price) > 0 && !isHidden(r.visible)).map((r, i) => {
        const cat = parseCategory(r.category);
        return { id: r.id, cat, name: r.name, vi: r.vi, price: toPrice(r.price), size: r.size, note: r.note, ings: list(r.ings), image: imageUrl(r.image), photo: r.name, swatch: pickSwatch(r.id, d.products, i) };
      })
    : d.products;

  const storyRows = rows(raw, "story");
  const story = storyRows ? storyRows.filter((r) => r.text).map((r) => ({ kicker: r.kicker, text: r.text, ing: r.ing })) : d.story;

  const recipeRows = rows(raw, "recipes");
  const recipes = recipeRows
    ? recipeRows.filter((r) => r.name).map((r, i) => ({ name: r.name, vi: r.vi, time: r.time, method: r.method, productId: r.productId, image: imageUrl(r.image), photo: r.name, swatch: SOFT_SWATCHES[i % SOFT_SWATCHES.length] }))
    : d.recipes;

  const boxRows = rows(raw, "box");
  const box = boxRows ? boxRows.filter((r) => r.name && toPrice(r.price) > 0).map((r) => ({ name: r.name, stems: r.stems, price: toPrice(r.price) })) : d.box;

  const expRows = rows(raw, "experiences");
  const experiences = expRows
    ? expRows.filter((r) => r.name && toPrice(r.price) > 0).map((r) => ({ name: r.name, vi: r.vi, duration: r.duration, desc: r.desc, price: toPrice(r.price) }))
    : d.experiences;

  return {
    settings,
    products,
    ingredients,
    // Drop links to ingredients that no longer exist rather than crash on them.
    story: story.filter((b) => ingredients.some((g) => g.id === b.ing) || !b.ing),
    recipes,
    box: box.length ? box : d.box,
    experiences: experiences.length ? experiences : d.experiences,
  };
}

export const feesOf = (s: Settings) => ({
  delivery: toPrice(s.delivery_fee),
  freeFrom: toPrice(s.free_delivery_from),
  wrap: toPrice(s.wrap_fee),
});

export const BOX_FREQUENCIES = ["Weekly", "Fortnightly", "Monthly"];
/** Bag key for a flower-box subscription; the Apps Script parses the same format. */
export const boxKey = (name: string, freq: number) => `box:${name}:${freq}`;

/** Current price for a bag key, or null if it is no longer sold (used to refresh a saved bag). */
export function priceOf(key: string, c: SiteContent): number | null {
  if (key.startsWith("box:")) {
    const [, name, freq] = key.split(":");
    const b = c.box.find((x) => x.name === name);
    return b && BOX_FREQUENCIES[Number(freq)] ? b.price : null;
  }
  return c.products.find((p) => p.id === key)?.price ?? null;
}

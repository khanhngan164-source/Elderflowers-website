// Prints the site's built-in content as sheet rows (JSON). Used by build_template.py to make the
// starter Google Sheet, so the sheet starts out identical to what the website shows today.
//   npx tsx cms/export-defaults.ts > /tmp/defaults.json
import schema from "./schema.json";
import { DEFAULT_CONTENT, SETTINGS } from "../src/lib/content";
import { CATEGORIES } from "../src/lib/data";

const c = DEFAULT_CONTENT;
const months = (m: number[]) => (m.length === 12 ? "Quanh năm" : m.map((x) => x + 1).join(", "));

const values: Record<keyof typeof schema.tabs, Record<string, string | number>[]> = {
  products: c.products.map((p) => ({ id: p.id, category: CATEGORIES[p.cat].vi, name: p.name, vi: p.vi, price: p.price, size: p.size, note: p.note, ings: p.ings.join(", "), image: "", visible: "Có" })),
  ingredients: c.ingredients.map((g) => ({ id: g.id, name: g.name, vi: g.vi, where: g.where, months: months(g.months), story: g.story, image: "", photo: g.photo })),
  story: c.story.map((b) => ({ kicker: b.kicker, text: b.text, ing: b.ing })),
  recipes: c.recipes.map((r) => ({ name: r.name, vi: r.vi, time: r.time, method: r.method, productId: r.productId, image: "" })),
  box: c.box.map((b) => ({ name: b.name, stems: b.stems, price: b.price })),
  experiences: c.experiences.map((e) => ({ name: e.name, vi: e.vi, duration: e.duration, desc: e.desc, price: e.price })),
};

const tabs = Object.fromEntries(
  Object.entries(schema.tabs).map(([key, { sheet, columns }]) => {
    const fields = Object.keys(columns) as (keyof typeof columns)[];
    return [sheet, { headers: fields.map((f) => columns[f]), rows: values[key as keyof typeof values].map((r) => fields.map((f) => r[f] ?? "")) }];
  }),
);

console.log(JSON.stringify({ schema, settings: SETTINGS.map(([k, v, note]) => [k, v, note]), tabs, categories: Object.values(CATEGORIES).map((x) => x.vi) }, null, 1));

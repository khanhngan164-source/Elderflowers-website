// Catalogue and content data, ported from design/Elderflowers Garden Website.dc.html.
// Product names (Elderflower Cordial, Lemon with Honey, Mint Soap, candles) come from the client;
// other products, all prices, story copy, address and visit experiences are PLACEHOLDER content
// to be confirmed. In production this should come from a headless commerce backend / CMS.

export type Swatch = [string, string];

export type CategoryId = "cordial" | "flowers" | "candle" | "bath";

export const CATEGORIES: Record<CategoryId, { en: string; vi: string }> = {
  cordial: { en: "Cordials", vi: "Siro" },
  flowers: { en: "Flowers", vi: "Hoa tươi" },
  candle: { en: "Candles", vi: "Nến thơm" },
  bath: { en: "Bath", vi: "Tắm gội" },
};

export type Ingredient = {
  id: string;
  name: string;
  vi: string;
  where: string;
  /** Months in season, 0 = January. */
  months: number[];
  swatch: Swatch;
  photo: string;
  story: string;
};

export const INGREDIENTS: Ingredient[] = [
  { id: "elder", name: "Elderflower", vi: "Hoa cơm cháy", where: "Upper terraces, Madagui · Lâm Đồng", months: [9, 10, 11, 0, 1], swatch: ["#EDE4C4", "#E3D8B0"], photo: "Elderflower umbels, close", story: "Creamy umbels that open for only a few weeks after the rains. We pick at first light, when the pollen still holds its honeyed scent, and steep them the same morning." },
  { id: "lemon", name: "Lemon", vi: "Chanh", where: "Lower orchard, Madagui", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], swatch: ["#EFE6A8", "#E6DB92"], photo: "Lemons in a bamboo basket", story: "Thin-skinned, fragrant lemons that fruit almost all year in the mild highland air. The zest goes into cordial, the peel into candles." },
  { id: "honey", name: "Wild honey", vi: "Mật ong rừng", where: "Forest hives, Đạ Huoai", months: [2, 3, 4], swatch: ["#E8CF9A", "#DEC283"], photo: "Honeycomb on a wooden board", story: "Gathered once a year from hives in the forest below the farm, when the coffee and longan blossom. Dark, floral and a little smoky." },
  { id: "mint", name: "Mint", vi: "Bạc hà", where: "Kitchen garden, Madagui", months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], swatch: ["#D3E0C9", "#C4D4B8"], photo: "Mint beds after rain", story: "Grown along the stream that runs through the kitchen garden. Cut weekly for cold-process soap and steeped into cordials." },
  { id: "lemongrass", name: "Lemongrass", vi: "Sả", where: "Bảo Lộc partner farm", months: [4, 5, 6, 7, 8, 9], swatch: ["#DCE2C4", "#CFD7B3"], photo: "Lemongrass bundles drying", story: "Bright and green-citrus. Our friends in Bảo Lộc distil it for candles and hand wash." },
  { id: "pomelo", name: "Pomelo", vi: "Bưởi", where: "Orchards in Bến Tre", months: [7, 8, 9, 10, 11, 0], swatch: ["#EFE9DA", "#E4DCC8"], photo: "Pomelo peel drying in the sun", story: "The peel, roasted the old way, goes into our shampoo; the blossom scents our best-loved candle." },
  { id: "daquy", name: "Wild sunflower", vi: "Dã quỳ", where: "Hillsides around Đà Lạt", months: [9, 10, 11], swatch: ["#F0D88E", "#E8CC75"], photo: "Dã quỳ along the hill road", story: "Every November the highland roads turn gold. We cut a handful for each flower box while they last." },
];

export type Product = {
  id: string;
  cat: CategoryId;
  name: string;
  vi: string;
  price: number;
  size: string;
  ings: string[];
  note: string;
  swatch: Swatch;
  photo: string;
};

export const PRODUCTS: Product[] = [
  { id: "elder", cat: "cordial", name: "Elderflower Cordial", vi: "Siro hoa cơm cháy", price: 220000, size: "250ml", ings: ["elder", "lemon"], note: "Honeyed elderflower, a lift of lemon.", swatch: ["#EDE4C4", "#E3D8B0"], photo: "Cordial bottle" },
  { id: "lemonhoney", cat: "cordial", name: "Lemon with Honey Cordial", vi: "Siro chanh mật ong", price: 200000, size: "250ml", ings: ["lemon", "honey"], note: "Sharp lemon, dark forest honey.", swatch: ["#EFE0A6", "#E5D48F"], photo: "Cordial bottle" },
  { id: "wildbox", cat: "flowers", name: "The Madagui Wild Box", vi: "Hộp hoa đồng nội", price: 450000, size: "Petite", ings: ["daquy", "elder"], note: "Dã quỳ, cosmos, field grasses.", swatch: ["#ECD9A0", "#E3CD8C"], photo: "Flower box" },
  { id: "mintsoap", cat: "bath", name: "Mint Soap", vi: "Xà bông bạc hà", price: 160000, size: "120g bar", ings: ["mint"], note: "Cold-process, cured six weeks.", swatch: ["#D3E0C9", "#C4D4B8"], photo: "Soap bar" },
  { id: "elcandle", cat: "candle", name: "Elderflower & Lemon Candle", vi: "Nến hoa cơm cháy & chanh", price: 590000, size: "220g", ings: ["elder", "lemon"], note: "Lemon zest, elderflower, soft musk.", swatch: ["#F0EAD2", "#E6DEC0"], photo: "Candle" },
  { id: "pomcandle", cat: "candle", name: "Pomelo Blossom Candle", vi: "Nến hoa bưởi", price: 590000, size: "220g", ings: ["pomelo"], note: "Pomelo blossom, jasmine, white wood.", swatch: ["#EFE9DA", "#E4DCC8"], photo: "Candle" },
  { id: "lgcandle", cat: "candle", name: "Lemongrass & Mint Candle", vi: "Nến sả & bạc hà", price: 560000, size: "220g", ings: ["lemongrass", "mint"], note: "Lemongrass, mint leaf, vetiver.", swatch: ["#DCE2C4", "#CFD7B3"], photo: "Candle" },
  { id: "shampoo", cat: "bath", name: "Pomelo Peel Shampoo", vi: "Dầu gội vỏ bưởi", price: 380000, size: "300ml", ings: ["pomelo"], note: "Our grandmothers’ hair wash, reformulated.", swatch: ["#E1D3BC", "#D5C5AB"], photo: "Shampoo" },
];

export const STORY_BLOCKS = [
  { kicker: "I · The hill", ing: "elder", text: "Madagui sits on the old road between Saigon and Đà Lạt, where the lowlands give way to pine and cool red soil. The terraces once grew coffee. Now they grow elderflower, and every morning the mist decides when we can start." },
  { kicker: "II · The orchard & the forest", ing: "honey", text: "Below the terraces are lemon trees our neighbours planted thirty years ago, and below those, the forest. Once a year we walk down with the beekeepers to gather wild honey for our Lemon with Honey cordial." },
  { kicker: "III · The kitchen garden", ing: "mint", text: "Along the stream, mint grows faster than we can cut it. Most goes into soap, cured on wooden racks in the old drying house for six weeks." },
];

export const RECIPES = [
  { name: "Elderflower spritz", vi: "Spritz hoa cơm cháy", time: "2 min · aperitivo", productId: "elder", photo: "Spritz on stone", method: "30ml cordial, top with sparkling wine, a sprig of mint.", swatch: ["#EDE4C4", "#E3D8B0"] as Swatch },
  { name: "Hot lemon & honey", vi: "Chanh mật ong nóng", time: "3 min · rainy day", productId: "lemonhoney", photo: "Steaming glass", method: "40ml cordial, hot water, a coin of ginger.", swatch: ["#EFE0A6", "#E5D48F"] as Swatch },
  { name: "Elderflower & mint iced tea", vi: "Trà đá hoa cơm cháy", time: "5 min · afternoon", productId: "elder", photo: "Iced tea, mint", method: "Cold green tea, 25ml cordial, crushed mint, lots of ice.", swatch: ["#D3E0C9", "#C4D4B8"] as Swatch },
];

export const BOX_SIZES = [
  { name: "Petite", stems: "8–10 stems · a bedside jar", price: 450000 },
  { name: "Garden", stems: "15–18 stems · the kitchen table", price: 650000 },
  { name: "Abundance", stems: "25+ stems · the whole house", price: 950000 },
];
export const BOX_FREQUENCIES = ["Weekly", "Fortnightly", "Monthly"];
export const BOX_SWATCH: Swatch = ["#ECD9A0", "#E3CD8C"];

export const EXPERIENCES = [
  { name: "Morning harvest walk", vi: "Dạo vườn buổi sáng", duration: "2 hours", desc: "Pick elderflower at first light, then breakfast on the terrace.", price: 450000 },
  { name: "Cordial workshop", vi: "Lớp làm siro", duration: "3 hours", desc: "Steep, strain and bottle your own — take two home.", price: 850000 },
  { name: "Long-table supper", vi: "Bữa tối bàn dài", duration: "Evening", desc: "A seasonal dinner from the garden, under the pines.", price: 1200000 },
];
export const MAX_GUESTS = 8;

export const DELIVERY_SLOTS = [
  { label: "Today · Hôm nay", note: "16:00 – 19:00" },
  { label: "Tomorrow · Ngày mai", note: "09:00 – 12:00" },
  { label: "Tomorrow · Ngày mai", note: "14:00 – 17:00" },
];
export const PAYMENT_METHODS = ["COD", "Card", "MoMo"];

export const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const MONTHS_VI = ["Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"];
export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const ingredientById = (id: string) => INGREDIENTS.find((g) => g.id === id)!;
export const productById = (id: string) => PRODUCTS.find((p) => p.id === id)!;

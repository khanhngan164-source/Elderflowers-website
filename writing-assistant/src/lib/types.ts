import { z } from "zod";

export const KINDS = ["email", "message", "document"] as const;
export const KIND_LABEL: Record<(typeof KINDS)[number], string> = {
  email: "Email",
  message: "Tin nhắn",
  document: "Văn bản",
};

export const MODES = ["translate", "rewrite"] as const;
export const MODE_LABEL: Record<(typeof MODES)[number], string> = {
  translate: "Dịch sát ý",
  rewrite: "Viết lại cho tự nhiên",
};
export const MODE_HINT: Record<(typeof MODES)[number], string> = {
  translate: "Giữ nguyên ý và bố cục, chỉ chuyển sang tiếng Anh chuẩn.",
  rewrite: "Ghi ý chính hoặc nháp lộn xộn cũng được, AI viết thành bản hoàn chỉnh.",
};

export const TONES = ["formal", "polite", "friendly"] as const;
export const TONE_LABEL: Record<(typeof TONES)[number], string> = {
  formal: "Trang trọng",
  polite: "Lịch sự, tự nhiên",
  friendly: "Thân thiện",
};

export const SettingsSchema = z.object({
  signature: z.string().max(1000).default(""),
  /** One term per line: "Vietnamese = English", or a name to keep as is. */
  glossary: z.string().max(4000).default(""),
  rules: z.string().max(2000).default(""),
});
export type Settings = z.infer<typeof SettingsSchema>;

export const WriteRequestSchema = z.object({
  text: z.string().trim().min(1, "Chưa nhập nội dung").max(20_000, "Nội dung quá dài (tối đa 20.000 ký tự)"),
  kind: z.enum(KINDS),
  mode: z.enum(MODES),
  tone: z.enum(TONES),
  context: z.string().max(1000).default(""),
  settings: SettingsSchema,
  previous: z.string().max(30_000).default(""),
  revision: z.string().max(1000).default(""),
});
export type WriteRequest = z.infer<typeof WriteRequestSchema>;

export const WriteResultSchema = z.object({
  subject: z.string().describe("English subject line for an email; empty string for messages and documents"),
  english: z.string().describe("The finished English text, ready to paste"),
  back_translation_vi: z
    .string()
    .describe("Faithful Vietnamese translation of the English text, so the author can check the meaning"),
  notes: z
    .array(z.string())
    .describe("In Vietnamese: ambiguities you resolved, placeholders left, or wording the author should check. Empty if none."),
});
export type WriteResult = z.infer<typeof WriteResultSchema>;

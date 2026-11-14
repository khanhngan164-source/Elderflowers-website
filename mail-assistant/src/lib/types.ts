import { z } from "zod";

export const PARTNER_TYPES = ["customer", "agency", "partner", "supplier", "other"] as const;
export const PARTNER_TYPE_LABEL: Record<(typeof PARTNER_TYPES)[number], string> = {
  customer: "Khách hàng",
  agency: "Agency",
  partner: "Đối tác",
  supplier: "Nhà cung ứng",
  other: "Khác",
};

export const FORMALITIES = ["formal", "neutral", "friendly"] as const;
export const FORMALITY_LABEL: Record<(typeof FORMALITIES)[number], string> = {
  formal: "Trang trọng",
  neutral: "Lịch sự, tự nhiên",
  friendly: "Thân thiện",
};

export const LENGTHS = ["short", "medium", "detailed"] as const;
export const LENGTH_LABEL: Record<(typeof LENGTHS)[number], string> = {
  short: "Ngắn (2–4 câu)",
  medium: "Vừa",
  detailed: "Chi tiết",
};

const text = (max: number) => z.string().max(max).default("");

export const PartnerSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  /** Addresses or bare domains ("@acme.com") that identify this partner. */
  emails: z.array(z.string().max(200)).default([]),
  company: text(200),
  type: z.enum(PARTNER_TYPES).default("customer"),
  formality: z.enum(FORMALITIES).default("neutral"),
  language: z.string().max(50).default("English"),
  /** How to talk to them: preferences, sensitivities, what works. */
  notes: text(4000),
  /** Facts the reply must respect: agreed prices, terms, past issues. */
  history: text(8000),
});
export type Partner = z.infer<typeof PartnerSchema>;

export const ScenarioSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  goal: text(2000),
  keyPoints: text(4000),
  avoid: text(2000),
  example: text(6000),
});
export type Scenario = z.infer<typeof ScenarioSchema>;

export const StyleSchema = z.object({
  myName: text(200),
  myRole: text(200),
  company: text(200),
  signature: text(1000),
  rules: text(4000),
  defaultLanguage: z.string().max(50).default("English"),
});
export type Style = z.infer<typeof StyleSchema>;

export const LibrarySchema = z.object({
  version: z.literal(1),
  partners: z.array(PartnerSchema).max(2000),
  scenarios: z.array(ScenarioSchema).max(500),
  style: StyleSchema,
});
export type Library = z.infer<typeof LibrarySchema>;

/** What the browser sends to /api/draft. Partner and scenario are sent whole: the server keeps no data. */
export const DraftRequestSchema = z.object({
  incoming: z.string().trim().min(1, "Chưa dán email cần trả lời").max(40_000, "Email quá dài (tối đa 40.000 ký tự)"),
  myPoints: text(4000),
  language: z.string().min(1).max(50),
  length: z.enum(LENGTHS),
  partner: PartnerSchema.nullable(),
  scenario: ScenarioSchema.nullable(),
  style: StyleSchema,
  previousDraft: text(20_000),
  revision: text(2000),
});
export type DraftRequest = z.infer<typeof DraftRequestSchema>;

export const DraftResultSchema = z.object({
  subject: z.string().describe("Reply subject line, usually 'Re: <original subject>'"),
  body: z.string().describe("The full reply email body including greeting and sign-off, in the requested language"),
  summary_vi: z.string().describe("2-3 sentence Vietnamese summary of what the reply says and commits to"),
  needs_check: z
    .array(z.string())
    .describe("In Vietnamese: every placeholder left in the body and every claim the sender should verify before sending"),
});
export type DraftResult = z.infer<typeof DraftResultSchema>;

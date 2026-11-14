import { LibrarySchema, type Library } from "./types";

export const STORAGE_KEY = "mail-assistant:library:v1";

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Starting content: a few common situations so the app is useful on day one. Edit freely. */
export function defaultLibrary(): Library {
  return {
    version: 1,
    style: {
      myName: "",
      myRole: "",
      company: "Elderflowers Garden",
      signature: "",
      rules:
        "- Short paragraphs, plain English.\n- Use British or American spelling consistently (American).\n- Always give a clear next step at the end.",
      defaultLanguage: "English",
    },
    partners: [
      {
        id: "example-partner",
        name: "Jane Doe (VÍ DỤ – sửa hoặc xoá)",
        emails: ["jane@example.com"],
        company: "Example Hotel",
        type: "customer",
        formality: "neutral",
        language: "English",
        notes: "Prefers short emails with bullet points. Replies fast in the morning (GMT+7).",
        history: "Orders table flowers every Monday. Agreed price: [điền giá thật]. Late delivery once in March; we gave 10% off.",
      },
    ],
    scenarios: [
      {
        id: "quote",
        name: "Báo giá / trả lời hỏi giá",
        goal: "Give a clear quote and make it easy to place the order.",
        keyPoints: "- Thank them for the inquiry\n- Price, minimum order, lead time\n- What is included (delivery, packaging)\n- How to confirm the order",
        avoid: "- Do not offer a discount unless I say so",
        example: "",
      },
      {
        id: "delay",
        name: "Thông báo trễ hàng / sự cố",
        goal: "Own the problem, give a new date, keep the relationship.",
        keyPoints: "- Apologise once, sincerely, without excuses\n- What happened in one sentence\n- New date or next update time\n- What we are doing so it does not repeat",
        avoid: "- Blaming the supplier or weather at length\n- Promising compensation I have not approved",
        example: "",
      },
      {
        id: "decline",
        name: "Từ chối lịch sự",
        goal: "Say no clearly while keeping the door open.",
        keyPoints: "- Thank them\n- A clear no with a brief reason\n- An alternative if there is one",
        avoid: "- Vague answers that sound like maybe",
        example: "",
      },
      {
        id: "payment",
        name: "Nhắc thanh toán",
        goal: "Get paid without damaging the relationship.",
        keyPoints: "- Invoice number, amount, due date\n- Payment details\n- Ask them to confirm the payment date",
        avoid: "- Threatening tone on a first reminder",
        example: "",
      },
      {
        id: "supplier-negotiate",
        name: "Đàm phán với nhà cung ứng",
        goal: "Get better terms while staying a partner they want to keep.",
        keyPoints: "- Our volume or long-term plan\n- The specific terms we want\n- A deadline for their answer",
        avoid: "- Revealing our maximum budget",
        example: "",
      },
      {
        id: "follow-up",
        name: "Follow-up khi chưa được phản hồi",
        goal: "Get a reply without sounding pushy.",
        keyPoints: "- Refer to the earlier email in one line\n- Make the ask easy to answer (yes/no or a choice)",
        avoid: "- Guilt-tripping phrases like 'As per my last email'",
        example: "",
      },
    ],
  };
}

/** Parses stored or imported JSON. Throws a readable error instead of loading broken data. */
export function parseLibrary(json: string): Library {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("File không phải JSON hợp lệ.");
  }
  const result = LibrarySchema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`Dữ liệu không đúng định dạng (${issue.path.join(".") || "gốc"}: ${issue.message}).`);
  }
  return result.data;
}

export function loadLibrary(): Library {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return parseLibrary(raw);
  } catch {
    // Unreadable storage (private window, corrupted value): start from defaults rather than crash.
  }
  return defaultLibrary();
}

export function saveLibrary(lib: Library): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
    return true;
  } catch {
    return false;
  }
}

import { CMS_URL } from "./config";

export type CmsResult = { ok: true; ref?: string; total?: number; pay?: string; bank?: { id: string; account: string; name: string } | null } | { ok: false; error: string };

export const ORDERING_ENABLED = Boolean(CMS_URL);

/**
 * Send an order, booking or newsletter sign-up to the Apps Script. The body is sent as text/plain
 * so the browser skips the CORS preflight, which Apps Script cannot answer.
 */
export async function postToCms(payload: Record<string, unknown>): Promise<CmsResult> {
  if (!CMS_URL) return { ok: false, error: "Đặt online chưa mở. Vui lòng nhắn Zalo cho shop. · Online ordering isn't open yet." };
  try {
    const res = await fetch(CMS_URL, { method: "POST", body: JSON.stringify(payload) });
    const data = await res.json();
    return data.ok ? data : { ok: false, error: data.error || "Có lỗi xảy ra, vui lòng thử lại." };
  } catch {
    return { ok: false, error: "Không gửi được, vui lòng kiểm tra mạng và thử lại. · Couldn't send, please try again." };
  }
}

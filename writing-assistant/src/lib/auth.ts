import { timingSafeEqual, createHash } from "node:crypto";

export type AuthResult = { ok: true } | { ok: false; status: number; error: string };

/**
 * The AI route spends money on every call, so a deployed app must have a password.
 * Without APP_PASSWORD it only works in local development.
 */
export function checkPassword(given: string | null, expected: string | undefined, isProduction: boolean): AuthResult {
  if (!expected) {
    return isProduction
      ? { ok: false, status: 500, error: "Máy chủ chưa đặt APP_PASSWORD nên AI bị khoá." }
      : { ok: true };
  }
  const a = createHash("sha256").update(given ?? "").digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b) ? { ok: true } : { ok: false, status: 401, error: "Sai mật khẩu." };
}

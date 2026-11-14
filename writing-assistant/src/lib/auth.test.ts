import { describe, expect, it } from "vitest";
import { checkPassword } from "./auth";

describe("checkPassword", () => {
  it("locks production when no password is configured", () => {
    expect(checkPassword(null, undefined, true).ok).toBe(false);
  });
  it("allows local development without a password", () => {
    expect(checkPassword(null, undefined, false).ok).toBe(true);
  });
  it("checks the password", () => {
    expect(checkPassword("secret", "secret", true).ok).toBe(true);
    expect(checkPassword("wrong", "secret", true)).toEqual({ ok: false, status: 401, error: "Sai mật khẩu." });
    expect(checkPassword(null, "secret", true).ok).toBe(false);
  });
});

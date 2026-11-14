import { describe, expect, it } from "vitest";
import { checkPassword } from "./auth";
import { defaultLibrary, parseLibrary } from "./store";

describe("parseLibrary", () => {
  it("round-trips the default library", () => {
    const lib = defaultLibrary();
    expect(parseLibrary(JSON.stringify(lib))).toEqual(lib);
  });
  it("rejects invalid JSON with a readable message", () => {
    expect(() => parseLibrary("{nope")).toThrow("JSON");
  });
  it("rejects a file from another app", () => {
    expect(() => parseLibrary(JSON.stringify({ hello: 1 }))).toThrow("không đúng định dạng");
  });
  it("fills defaults for fields missing from older backups", () => {
    const lib = defaultLibrary();
    const { notes: _n, history: _h, ...partial } = lib.partners[0];
    const parsed = parseLibrary(JSON.stringify({ ...lib, partners: [partial] }));
    expect(parsed.partners[0].notes).toBe("");
  });
});

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

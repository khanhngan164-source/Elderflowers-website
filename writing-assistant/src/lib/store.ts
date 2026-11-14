import { SettingsSchema, type Settings } from "./types";

const SETTINGS_KEY = "writing-assistant:settings:v1";

export const DEFAULT_SETTINGS: Settings = {
  signature: "",
  glossary: "Elderflowers Garden (giữ nguyên)\nMadagui, Lâm Đồng (giữ nguyên)\ncành = stem\nbó hoa = bouquet",
  rules: "American spelling.",
};

export function parseSettings(json: string | null): Settings {
  if (!json) return DEFAULT_SETTINGS;
  try {
    const result = SettingsSchema.safeParse(JSON.parse(json));
    return result.success ? result.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function loadSettings(): Settings {
  try {
    return parseSettings(window.localStorage.getItem(SETTINGS_KEY));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Settings): boolean {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

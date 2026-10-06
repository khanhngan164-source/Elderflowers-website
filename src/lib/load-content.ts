import "server-only";
import { CMS_URL, CONTENT_REVALIDATE_SECONDS } from "./config";
import { DEFAULT_CONTENT, parseContent, type RawContent, type SiteContent } from "./content";

/**
 * Fetch content from the sheet on the server. Vercel re-runs this at most once per
 * CONTENT_REVALIDATE_SECONDS. If the sheet is unreachable we throw, and Next.js keeps serving the
 * last good page — except during the very first build, where we fall back to built-in content.
 */
export async function loadContent(): Promise<SiteContent> {
  if (!CMS_URL) return DEFAULT_CONTENT;
  try {
    const res = await fetch(`${CMS_URL}?action=content`, { next: { revalidate: CONTENT_REVALIDATE_SECONDS } });
    if (!res.ok) throw new Error(`Content sheet responded ${res.status}`);
    const raw = (await res.json()) as RawContent & { ok?: boolean; error?: string };
    if (raw.ok === false) throw new Error(raw.error || "Content sheet returned an error");
    return parseContent(raw);
  } catch (err) {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      console.warn("Could not load content from the sheet, building with defaults:", err);
      return DEFAULT_CONTENT;
    }
    throw err;
  }
}

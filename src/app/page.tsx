import { HomePage } from "@/components/HomePage";
import { loadContent } from "@/lib/load-content";

// Re-read the content sheet at most once a minute (Vercel incremental static regeneration).
export const revalidate = 60;

export default async function Page() {
  const content = await loadContent();
  return <HomePage content={content} />;
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product photos come from Google Drive / any https URL and are served as-is.
  images: { unoptimized: true },
  // The page is pre-rendered on the server; the client swaps in the real date after mount.
  // Baking the build date in keeps the first client render identical to the HTML.
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString() },
};

export default nextConfig;

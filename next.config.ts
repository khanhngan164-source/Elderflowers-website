import type { NextConfig } from "next";

// Static export: `npm run build` writes a plain HTML/CSS/JS site to `out/`,
// deployable to Vercel, Netlify or GitHub Pages without a Node server.
// Set NEXT_PUBLIC_BASE_PATH (e.g. "/Elderflowers-website") when serving from a sub-path.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  // The page is pre-rendered at build time; the client swaps in the real date after mount.
  // Baking the build date in keeps the first client render identical to the static HTML.
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString() },
};

export default nextConfig;

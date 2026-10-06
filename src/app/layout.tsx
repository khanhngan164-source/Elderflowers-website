import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Instrument_Serif, Newsreader } from "next/font/google";
import "./globals.css";

const serif = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
// Instrument Serif has no Vietnamese glyphs (ơ, ư, ạ, ế, ộ… fall back to a system font mid-word),
// so Vietnamese lines are set in Newsreader, an editorial serif with full Vietnamese coverage.
const serifVi = Newsreader({ subsets: ["latin", "vietnamese"], style: ["normal", "italic"], variable: "--font-serif-vi" });
const sans = Hanken_Grotesk({ subsets: ["latin", "latin-ext", "vietnamese"], weight: ["400", "500", "600"], variable: "--font-sans" });
// Only used for photo-placeholder captions — drop once real photography is in.
const mono = IBM_Plex_Mono({ subsets: ["latin", "vietnamese"], weight: "400", variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Elderflowers Garden — Cordials, flowers & herbal goods from Madagui",
  description: "Cordials, fresh flower boxes and herbal goods from a farm in Madagui, Lâm Đồng. Siro, hoa tươi và sản phẩm thảo mộc từ vườn Madagui.",
};

export const viewport: Viewport = { themeColor: "#F5F0E6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${serifVi.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

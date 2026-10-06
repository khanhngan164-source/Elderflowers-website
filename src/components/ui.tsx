"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { Swatch } from "@/lib/data";

/** Today's date. Equals the build date on the first render (matching the static HTML), then the real date. */
export function useToday() {
  const [today, setToday] = useState(() => new Date(process.env.NEXT_PUBLIC_BUILD_DATE ?? Date.now()));
  useEffect(() => setToday(new Date()), []);
  return today;
}

/** Placeholder stripe colours, with the real photo layered on top when one is set (stripes show if it fails). */
export const swatchVars = (s: Swatch, image?: string) =>
  ({
    "--t1": s[0],
    "--t2": s[1],
    ...(image
      ? { backgroundImage: `url("${image.replace(/"/g, "%22")}"), repeating-linear-gradient(135deg, ${s[0]} 0 6px, ${s[1]} 6px 12px)`, backgroundSize: "cover", backgroundPosition: "center" }
      : {}),
  }) as CSSProperties;

/**
 * Striped photo placeholder from the design handoff. The caption describes the intended shot;
 * replace with real photography (<img>) once the client supplies it.
 */
export function Photo({ src, swatch, caption, className = "", dark = false, eager = false }: { src?: string; swatch: Swatch; caption?: string; className?: string; dark?: boolean; eager?: boolean }) {
  // A link that isn't an image (e.g. a web page) or a file that isn't shared falls back to the placeholder.
  const [failed, setFailed] = useState<string | null>(null);
  const img = useRef<HTMLImageElement>(null);
  // An image that already failed before hydration never fires onError, so check once after mount.
  useEffect(() => {
    const el = img.current;
    if (src && el && el.complete && el.naturalWidth === 0) setFailed(src);
  }, [src]);
  if (src && failed !== src) {
    return (
      <div className={`photo photo--img ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={img} src={src} alt={caption ?? ""} loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(src)} />
      </div>
    );
  }
  return (
    <div className={`photo ${dark ? "photo--dark" : ""} ${className}`} style={swatchVars(swatch)} role="img" aria-label={caption ? `Photo: ${caption}` : undefined}>
      {caption && <span className="photo__caption">Photo · {caption}</span>}
    </div>
  );
}

export function Stepper({ value, onDec, onInc, label, small = false }: { value: number; onDec: () => void; onInc: () => void; label: string; small?: boolean }) {
  return (
    <div className={`stepper ${small ? "stepper--sm" : ""}`} role="group" aria-label={label}>
      <button type="button" onClick={onDec} aria-label={`Decrease ${label}`}>−</button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={onInc} aria-label={`Increase ${label}`}>+</button>
    </div>
  );
}

export function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`toggle ${on ? "is-on" : ""}`} aria-hidden="true">
      <span className="toggle__knob" />
    </span>
  );
}

/**
 * Wordmark stand-in. The handoff references assets/logo-plum.png and logo-cream.png, but they
 * were not included in the upload. Drop them in public/assets/ and set LOGO_FILES = true.
 */
const LOGO_FILES = false;

export function Logo({ variant = "plum", size = 64 }: { variant?: "plum" | "cream"; size?: number }) {
  if (LOGO_FILES) {
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`${base}/assets/logo-${variant}.png`} alt="Elderflowers Garden" style={{ height: size, width: "auto", display: "block" }} />;
  }
  return (
    <span className={`wordmark wordmark--${variant}`} style={{ fontSize: size * 0.34 }}>
      Elderflowers
      <span>Garden</span>
    </span>
  );
}

// Letters Instrument Serif lacks (ă đ ĩ ũ ơ ư and every tone-marked vowel). Text containing them is
// set in the Vietnamese serif as a whole, so a word never mixes two typefaces.
const VI_ONLY = /[ăđĩũơưĂĐĨŨƠƯ\u0300-\u036f\u1EA0-\u1EF9]/;

/** Props for a serif element whose text comes from the sheet and may be Vietnamese. */
export const serifText = (text: string, className = "") =>
  VI_ONLY.test(text) ? { lang: "vi", className: `${className} serif-vi`.trim() } : { className };

"use client";

import type { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

export function TextInput(props: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={props.type ?? "text"}
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function TextArea(props: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={props.value}
      rows={props.rows ?? 4}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
    />
  );
}

export function Select<T extends string>(props: {
  value: T;
  onChange: (v: T) => void;
  options: readonly T[];
  labels: Record<T, string>;
}) {
  return (
    <select value={props.value} onChange={(e) => props.onChange(e.target.value as T)}>
      {props.options.map((o) => (
        <option key={o} value={o}>
          {props.labels[o]}
        </option>
      ))}
    </select>
  );
}

export const LANGUAGES = ["English", "Vietnamese", "French", "Japanese", "Korean", "Chinese"] as const;

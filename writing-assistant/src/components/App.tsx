"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/store";
import {
  KIND_LABEL,
  KINDS,
  MODE_HINT,
  MODE_LABEL,
  MODES,
  TONE_LABEL,
  TONES,
  type Settings,
  type WriteRequest,
  type WriteResult,
} from "@/lib/types";
import { Field, TextArea, TextInput } from "./fields";

const PASSWORD_KEY = "writing-assistant:password";

function Segmented<T extends string>(props: { value: T; onChange: (v: T) => void; options: readonly T[]; labels: Record<T, string>; name: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={props.name}>
      {props.options.map((o) => (
        <button key={o} type="button" role="radio" aria-checked={props.value === o} className={props.value === o ? "on" : ""} onClick={() => props.onChange(o)}>
          {props.labels[o]}
        </button>
      ))}
    </div>
  );
}

export function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("email");
  const [mode, setMode] = useState<(typeof MODES)[number]>("translate");
  const [tone, setTone] = useState<(typeof TONES)[number]>("polite");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<WriteResult | null>(null);
  const [english, setEnglish] = useState("");
  const [revision, setRevision] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [showBack, setShowBack] = useState(true);

  useEffect(() => {
    setSettings(loadSettings());
    try {
      setPassword(window.localStorage.getItem(PASSWORD_KEY) ?? "");
    } catch {
      /* storage blocked */
    }
  }, []);

  function updateSettings(patch: Partial<Settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  async function run(asRevision: boolean) {
    if (loading || !text.trim()) return;
    setLoading(true);
    setError("");
    setCopied("");
    const payload: WriteRequest = {
      text,
      kind,
      mode,
      tone,
      context,
      settings,
      previous: asRevision ? english : "",
      revision: asRevision ? revision : "",
    };
    try {
      const res = await fetch("/api/write", {
        method: "POST",
        headers: { "content-type": "application/json", "x-app-password": password },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({ error: "Máy chủ trả về dữ liệu lạ." }));
      if (!res.ok) throw new Error(data.error ?? `Lỗi ${res.status}`);
      setResult(data as WriteResult);
      setEnglish((data as WriteResult).english);
      if (asRevision) setRevision("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
    } catch {
      setError("Trình duyệt không cho copy tự động. Hãy chọn và copy thủ công.");
    }
  }

  const placeholders = [...new Set(english.match(/\[[^\]\n]{2,40}\]/g) ?? [])];
  const edited = result !== null && english !== result.english;

  return (
    <main className="shell">
      <header className="top">
        <h1>Viết tiếng Anh</h1>
        <label className="password">
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              try {
                window.localStorage.setItem(PASSWORD_KEY, e.target.value);
              } catch {
                /* ignore */
              }
            }}
          />
        </label>
      </header>

      <div className="workspace">
        <section className="panel">
          <div className="controls">
            <Segmented name="Loại" value={kind} onChange={setKind} options={KINDS} labels={KIND_LABEL} />
            <Segmented name="Giọng" value={tone} onChange={setTone} options={TONES} labels={TONE_LABEL} />
          </div>
          <Segmented name="Cách làm" value={mode} onChange={setMode} options={MODES} labels={MODE_LABEL} />
          <p className="field-hint mode-hint">{MODE_HINT[mode]}</p>

          <Field label="Nội dung tiếng Việt">
            <textarea
              value={text}
              rows={12}
              placeholder={
                mode === "translate"
                  ? "Chào chị Lan, bên em xác nhận giao 200 cành hồng vào thứ Hai tuần sau..."
                  : "- cảm ơn đã đặt hàng\n- giao thứ 2, 200 cành hồng\n- hỏi có cần thêm bình không"
              }
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(false);
              }}
            />
          </Field>
          <Field label="Bối cảnh (tuỳ chọn)" hint="Gửi cho ai, quan hệ thế nào. Ví dụ: khách sạn mới, lần đầu liên hệ.">
            <TextInput value={context} onChange={setContext} />
          </Field>
          <button type="button" className="primary wide" disabled={loading || !text.trim()} onClick={() => run(false)}>
            {loading ? "Đang viết…" : "Viết tiếng Anh"} <kbd>Ctrl+Enter</kbd>
          </button>
          {error && <p className="error">{error}</p>}
        </section>

        <section className="panel output">
          {!result ? (
            <p className="muted empty">Bản tiếng Anh sẽ hiện ở đây.</p>
          ) : (
            <>
              {result.notes.length > 0 && (
                <div className="check">
                  <strong>Lưu ý:</strong>
                  <ul>
                    {result.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
              {kind === "email" && result.subject && (
                <div className="subject">
                  <span>
                    <strong>Subject:</strong> {result.subject}
                  </span>
                  <button type="button" className="small" onClick={() => copy(result.subject, "subject")}>
                    {copied === "subject" ? "Đã copy ✓" : "Copy"}
                  </button>
                </div>
              )}
              <TextArea value={english} onChange={setEnglish} rows={14} />
              {placeholders.length > 0 && <p className="warn">Còn chỗ trống cần điền: {placeholders.join(", ")}</p>}
              <div className="actions">
                <button type="button" className="primary" onClick={() => copy(english, "body")}>
                  {copied === "body" ? "Đã copy ✓" : "Copy bản tiếng Anh"}
                </button>
                <button type="button" onClick={() => setShowBack((v) => !v)}>
                  {showBack ? "Ẩn" : "Xem"} bản dịch ngược
                </button>
              </div>
              {showBack && (
                <div className="back">
                  <strong>Bản tiếng Anh này nói:</strong>
                  {edited && <span className="field-hint"> (theo bản gốc của AI, trước khi bạn sửa)</span>}
                  <p>{result.back_translation_vi}</p>
                </div>
              )}
              <div className="revise">
                <Field label="Muốn sửa gì?">
                  <input
                    value={revision}
                    placeholder="Ngắn hơn / trang trọng hơn / bỏ câu xin lỗi…"
                    onChange={(e) => setRevision(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && revision.trim()) run(true);
                    }}
                  />
                </Field>
                <button type="button" disabled={loading || !revision.trim()} onClick={() => run(true)}>
                  {loading ? "Đang sửa…" : "Sửa"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <details className="panel settings">
        <summary>Cài đặt: chữ ký, thuật ngữ, quy tắc riêng</summary>
        <p className="field-hint">Lưu trong trình duyệt này và áp dụng cho mọi lần viết.</p>
        <Field label="Chữ ký email">
          <TextArea value={settings.signature} onChange={(v) => updateSettings({ signature: v })} rows={3} placeholder={"Best regards,\nNgan\nElderflowers Garden"} />
        </Field>
        <Field label="Bảng thuật ngữ" hint='Mỗi dòng một mục: "tiếng Việt = English", hoặc tên cần giữ nguyên.'>
          <TextArea value={settings.glossary} onChange={(v) => updateSettings({ glossary: v })} rows={5} />
        </Field>
        <Field label="Quy tắc riêng" hint="Ví dụ: không dùng dấu chấm than; gọi khách bằng tên.">
          <TextArea value={settings.rules} onChange={(v) => updateSettings({ rules: v })} rows={2} />
        </Field>
      </details>
    </main>
  );
}

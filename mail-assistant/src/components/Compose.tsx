"use client";

import { useMemo, useState } from "react";
import { extractSender, matchPartner } from "@/lib/match";
import { LENGTH_LABEL, LENGTHS, PARTNER_TYPE_LABEL, type DraftRequest, type DraftResult, type Library } from "@/lib/types";
import { Field, LANGUAGES, Select, TextArea, TextInput } from "./fields";

type Props = {
  library: Library;
  password: string;
  onAppendHistory: (partnerId: string, line: string) => void;
  onCreatePartner: (email: string) => void;
};

export function Compose({ library, password, onAppendHistory, onCreatePartner }: Props) {
  const [incoming, setIncoming] = useState("");
  const [senderOverride, setSenderOverride] = useState<string | null>(null);
  const [partnerOverride, setPartnerOverride] = useState<string | null>(null);
  const [scenarioId, setScenarioId] = useState("");
  const [myPoints, setMyPoints] = useState("");
  const [languageOverride, setLanguage] = useState<string | null>(null);
  const [length, setLength] = useState<(typeof LENGTHS)[number]>("medium");
  const [revision, setRevision] = useState("");
  const [result, setResult] = useState<DraftResult | null>(null);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [historyNote, setHistoryNote] = useState("");

  const sender = senderOverride ?? extractSender(incoming);
  const autoPartner = useMemo(() => matchPartner(sender, library.partners), [sender, library.partners]);
  const partnerId = partnerOverride ?? autoPartner?.id ?? "";
  const partner = library.partners.find((p) => p.id === partnerId) ?? null;
  const scenario = library.scenarios.find((s) => s.id === scenarioId) ?? null;
  const language = languageOverride ?? partner?.language ?? (library.style.defaultLanguage || "English");

  async function generate(asRevision: boolean) {
    setLoading(true);
    setError("");
    setCopied(false);
    const payload: DraftRequest = {
      incoming,
      myPoints,
      language,
      length,
      partner,
      scenario,
      style: library.style,
      previousDraft: asRevision ? body : "",
      revision: asRevision ? revision : "",
    };
    try {
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "content-type": "application/json", "x-app-password": password },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({ error: "Máy chủ trả về dữ liệu lạ." }));
      if (!res.ok) throw new Error(data.error ?? `Lỗi ${res.status}`);
      setResult(data as DraftResult);
      setBody((data as DraftResult).body);
      if (asRevision) setRevision("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
    } catch {
      setError("Trình duyệt không cho copy tự động. Hãy chọn và copy thủ công.");
    }
  }

  const placeholdersLeft = body.match(/\[[^\]\n]{2,60}\]/g) ?? [];

  return (
    <div className="compose">
      <section className="panel">
        <h2>1. Email nhận được</h2>
        <Field label="Dán toàn bộ email (kèm dòng From: nếu có)">
          <TextArea value={incoming} onChange={setIncoming} rows={10} placeholder={"From: Jane Doe <jane@example.com>\nSubject: Weekly order\n\nHi, could you send me..."} />
        </Field>

        <div className="row">
          <Field label="Người gửi">
            <TextInput value={sender} onChange={(v) => setSenderOverride(v)} placeholder="email@congty.com" />
          </Field>
          <Field label="Đối tác" hint={autoPartner && !partnerOverride ? "Tự nhận diện theo email" : undefined}>
            <select value={partnerId} onChange={(e) => setPartnerOverride(e.target.value)}>
              <option value="">— Chưa có hồ sơ —</option>
              {library.partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {PARTNER_TYPE_LABEL[p.type]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {!partner && sender.includes("@") && (
          <p className="notice">
            Chưa có hồ sơ cho {sender}. Không có hồ sơ thì AI viết theo giọng trung tính.{" "}
            <button type="button" className="link" onClick={() => onCreatePartner(sender)}>
              Tạo hồ sơ
            </button>
          </p>
        )}
      </section>

      <section className="panel">
        <h2>2. Bạn muốn trả lời gì</h2>
        <Field label="Tình huống">
          <select value={scenarioId} onChange={(e) => setScenarioId(e.target.value)}>
            <option value="">— Để AI tự hiểu —</option>
            {library.scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Ý chính (viết tiếng Việt cũng được)"
          hint="Ghi rõ số liệu: giá, ngày, số lượng. Thiếu số liệu thì AI để [chỗ trống] chứ không tự bịa."
        >
          <TextArea value={myPoints} onChange={setMyPoints} rows={5} placeholder={"Đồng ý giao thứ 2 tuần sau\nGiá 15.000đ/cành như cũ\nHỏi họ có cần thêm bình không"} />
        </Field>
        <div className="row">
          <Field label="Ngôn ngữ" hint={partner && !languageOverride ? "Theo hồ sơ đối tác" : undefined}>
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              {[...new Set([...LANGUAGES, language])].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Độ dài">
            <Select value={length} onChange={setLength} options={LENGTHS} labels={LENGTH_LABEL} />
          </Field>
        </div>
        <button type="button" className="primary" disabled={loading || !incoming.trim()} onClick={() => generate(false)}>
          {loading && !body ? "Đang viết…" : body ? "Viết lại từ đầu" : "Viết bản nháp"}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      {result && (
        <section className="panel result">
          <h2>3. Bản nháp — đọc lại trước khi gửi</h2>
          {result.needs_check.length > 0 && (
            <div className="check">
              <strong>Cần kiểm tra:</strong>
              <ul>
                {result.needs_check.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="summary">
            <strong>Tóm tắt:</strong> {result.summary_vi}
          </p>
          <Field label="Tiêu đề">
            <TextInput value={result.subject} onChange={(v) => setResult({ ...result, subject: v })} />
          </Field>
          <Field label="Nội dung (sửa trực tiếp được)">
            <TextArea value={body} onChange={setBody} rows={14} />
          </Field>
          {placeholdersLeft.length > 0 && (
            <p className="warn">Còn {placeholdersLeft.length} chỗ trống chưa điền: {[...new Set(placeholdersLeft)].join(", ")}</p>
          )}
          <div className="actions">
            <button type="button" className="primary" onClick={copy}>
              {copied ? "Đã copy ✓" : "Copy nội dung"}
            </button>
          </div>

          <div className="revise">
            <Field label="Muốn sửa gì?">
              <TextInput value={revision} onChange={setRevision} placeholder="Ngắn hơn / trang trọng hơn / bỏ đoạn xin lỗi…" />
            </Field>
            <button type="button" disabled={loading || !revision.trim()} onClick={() => generate(true)}>
              {loading ? "Đang sửa…" : "Sửa bản nháp"}
            </button>
          </div>

          {partner && (
            <div className="revise">
              <Field label={`Ghi nhớ vào hồ sơ ${partner.name}`} hint="Ví dụ điều vừa thoả thuận, để lần sau AI biết.">
                <TextInput value={historyNote} onChange={setHistoryNote} placeholder="Đã chốt giá 15.000đ/cành từ 11/2026" />
              </Field>
              <button
                type="button"
                disabled={!historyNote.trim()}
                onClick={() => {
                  onAppendHistory(partner.id, historyNote.trim());
                  setHistoryNote("");
                }}
              >
                Lưu ghi chú
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

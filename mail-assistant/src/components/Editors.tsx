"use client";

import { useRef, useState } from "react";
import { parseEmailList } from "@/lib/match";
import { newId, parseLibrary } from "@/lib/store";
import {
  FORMALITIES,
  FORMALITY_LABEL,
  PARTNER_TYPE_LABEL,
  PARTNER_TYPES,
  type Library,
  type Partner,
  type Scenario,
  type Style,
} from "@/lib/types";
import { Field, LANGUAGES, Select, TextArea, TextInput } from "./fields";

/* ---------- Partners ---------- */

export function blankPartner(email = ""): Partner {
  return {
    id: newId(),
    name: "",
    emails: email ? [email] : [],
    company: "",
    type: "customer",
    formality: "neutral",
    language: "English",
    notes: "",
    history: "",
  };
}

export function PartnersTab(props: {
  partners: Partner[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onSave: (p: Partner) => void;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const list = props.partners.filter(
    (p) => !q || [p.name, p.company, ...p.emails].some((v) => v.toLowerCase().includes(q)),
  );
  const selected = props.partners.find((p) => p.id === props.selectedId) ?? null;

  return (
    <div className="split">
      <aside className="panel list">
        <button type="button" className="primary" onClick={() => props.onSave({ ...blankPartner(), name: "Đối tác mới" })}>
          + Thêm đối tác
        </button>
        <input placeholder="Tìm tên, công ty, email…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <ul>
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" className={p.id === props.selectedId ? "item active" : "item"} onClick={() => props.onSelect(p.id)}>
                <span>{p.name}</span>
                <small>
                  {PARTNER_TYPE_LABEL[p.type]}
                  {p.company && ` · ${p.company}`}
                </small>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="muted">Không có kết quả.</li>}
        </ul>
      </aside>
      <section className="panel">
        {selected ? (
          <PartnerForm key={selected.id} partner={selected} onSave={props.onSave} onDelete={props.onDelete} />
        ) : (
          <p className="muted">Chọn một đối tác bên trái để sửa.</p>
        )}
      </section>
    </div>
  );
}

function PartnerForm({ partner, onSave, onDelete }: { partner: Partner; onSave: (p: Partner) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState(partner);
  const [emailsText, setEmailsText] = useState(partner.emails.join(", "));
  const set = <K extends keyof Partner>(k: K, v: Partner[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = JSON.stringify({ ...draft, emails: parseEmailList(emailsText) }) !== JSON.stringify(partner);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...draft, name: draft.name.trim() || "Chưa đặt tên", emails: parseEmailList(emailsText) });
      }}
    >
      <div className="row">
        <Field label="Tên người liên hệ">
          <TextInput value={draft.name} onChange={(v) => set("name", v)} />
        </Field>
        <Field label="Công ty">
          <TextInput value={draft.company} onChange={(v) => set("company", v)} />
        </Field>
      </div>
      <Field label="Email nhận diện" hint="Cách nhau bằng dấu phẩy. Ghi @congty.com để nhận cả công ty.">
        <TextInput value={emailsText} onChange={setEmailsText} placeholder="jane@acme.com, @acme.com" />
      </Field>
      <div className="row three">
        <Field label="Loại">
          <Select value={draft.type} onChange={(v) => set("type", v)} options={PARTNER_TYPES} labels={PARTNER_TYPE_LABEL} />
        </Field>
        <Field label="Giọng điệu">
          <Select value={draft.formality} onChange={(v) => set("formality", v)} options={FORMALITIES} labels={FORMALITY_LABEL} />
        </Field>
        <Field label="Ngôn ngữ">
          <select value={draft.language} onChange={(e) => set("language", e.target.value)}>
            {[...new Set([...LANGUAGES, draft.language])].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Cách giao tiếp" hint="Họ thích gì, ghét gì, điều gì hiệu quả. Ví dụ: thích gạch đầu dòng, không gọi tên riêng.">
        <TextArea value={draft.notes} onChange={(v) => set("notes", v)} rows={4} />
      </Field>
      <Field label="Lịch sử & thoả thuận" hint="Giá đã chốt, điều khoản, sự cố cũ. AI chỉ dùng số liệu ghi ở đây hoặc ở ý chính.">
        <TextArea value={draft.history} onChange={(v) => set("history", v)} rows={6} />
      </Field>
      <div className="actions">
        <button type="submit" className="primary" disabled={!dirty}>
          {dirty ? "Lưu" : "Đã lưu"}
        </button>
        <button
          type="button"
          className="danger"
          onClick={() => confirm(`Xoá hồ sơ "${partner.name}"?`) && onDelete(partner.id)}
        >
          Xoá
        </button>
      </div>
    </form>
  );
}

/* ---------- Scenarios ---------- */

export function ScenariosTab(props: { scenarios: Scenario[]; onSave: (s: Scenario) => void; onDelete: (id: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(props.scenarios[0]?.id ?? null);
  const selected = props.scenarios.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="split">
      <aside className="panel list">
        <button
          type="button"
          className="primary"
          onClick={() => {
            const s: Scenario = { id: newId(), name: "Tình huống mới", goal: "", keyPoints: "", avoid: "", example: "" };
            props.onSave(s);
            setSelectedId(s.id);
          }}
        >
          + Thêm tình huống
        </button>
        <ul>
          {props.scenarios.map((s) => (
            <li key={s.id}>
              <button type="button" className={s.id === selectedId ? "item active" : "item"} onClick={() => setSelectedId(s.id)}>
                <span>{s.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      <section className="panel">
        {selected ? (
          <ScenarioForm key={selected.id} scenario={selected} onSave={props.onSave} onDelete={props.onDelete} />
        ) : (
          <p className="muted">Chọn hoặc thêm một tình huống.</p>
        )}
      </section>
    </div>
  );
}

function ScenarioForm({ scenario, onSave, onDelete }: { scenario: Scenario; onSave: (s: Scenario) => void; onDelete: (id: string) => void }) {
  const [draft, setDraft] = useState(scenario);
  const set = <K extends keyof Scenario>(k: K, v: Scenario[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(scenario);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...draft, name: draft.name.trim() || "Chưa đặt tên" });
      }}
    >
      <Field label="Tên tình huống">
        <TextInput value={draft.name} onChange={(v) => set("name", v)} />
      </Field>
      <Field label="Mục tiêu của email trả lời">
        <TextInput value={draft.goal} onChange={(v) => set("goal", v)} placeholder="Ví dụ: chốt đơn trong tuần này" />
      </Field>
      <Field label="Các ý cần có">
        <TextArea value={draft.keyPoints} onChange={(v) => set("keyPoints", v)} rows={5} />
      </Field>
      <Field label="Tránh">
        <TextArea value={draft.avoid} onChange={(v) => set("avoid", v)} rows={3} />
      </Field>
      <Field label="Email mẫu bạn từng viết hay (tuỳ chọn)" hint="Một ví dụ thật giúp AI bắt giọng bạn tốt hơn mọi mô tả.">
        <TextArea value={draft.example} onChange={(v) => set("example", v)} rows={6} />
      </Field>
      <div className="actions">
        <button type="submit" className="primary" disabled={!dirty}>
          {dirty ? "Lưu" : "Đã lưu"}
        </button>
        <button type="button" className="danger" onClick={() => confirm(`Xoá "${scenario.name}"?`) && onDelete(scenario.id)}>
          Xoá
        </button>
      </div>
    </form>
  );
}

/* ---------- Style ---------- */

export function StyleTab({ style, onSave }: { style: Style; onSave: (s: Style) => void }) {
  const [draft, setDraft] = useState(style);
  const set = <K extends keyof Style>(k: K, v: Style[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(style);

  return (
    <section className="panel narrow">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(draft);
        }}
      >
        <div className="row">
          <Field label="Tên bạn">
            <TextInput value={draft.myName} onChange={(v) => set("myName", v)} />
          </Field>
          <Field label="Chức danh">
            <TextInput value={draft.myRole} onChange={(v) => set("myRole", v)} />
          </Field>
        </div>
        <div className="row">
          <Field label="Công ty">
            <TextInput value={draft.company} onChange={(v) => set("company", v)} />
          </Field>
          <Field label="Ngôn ngữ mặc định">
            <select value={draft.defaultLanguage} onChange={(e) => set("defaultLanguage", e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Chữ ký">
          <TextArea value={draft.signature} onChange={(v) => set("signature", v)} rows={4} placeholder={"Best regards,\nNgan\nElderflowers Garden · Madagui, Lâm Đồng"} />
        </Field>
        <Field label="Quy tắc viết chung" hint="Áp dụng cho mọi email. Viết ngắn, cụ thể.">
          <TextArea value={draft.rules} onChange={(v) => set("rules", v)} rows={6} />
        </Field>
        <button type="submit" className="primary" disabled={!dirty}>
          {dirty ? "Lưu" : "Đã lưu"}
        </button>
      </form>
    </section>
  );
}

/* ---------- Backup ---------- */

export function BackupTab({ library, onImport }: { library: Library; onImport: (lib: Library) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function exportFile() {
    const blob = new Blob([JSON.stringify(library, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mail-assistant-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importFile(file: File) {
    try {
      const lib = parseLibrary(await file.text());
      if (!confirm(`Thay toàn bộ dữ liệu hiện tại bằng file này (${lib.partners.length} đối tác, ${lib.scenarios.length} tình huống)?`)) return;
      onImport(lib);
      setMessage("Đã nhập dữ liệu.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Không đọc được file.");
    }
  }

  return (
    <section className="panel narrow">
      <h2>Sao lưu dữ liệu</h2>
      <p>
        Dữ liệu đối tác chỉ nằm trong trình duyệt này. Xoá dữ liệu trình duyệt, đổi máy hoặc dùng tab ẩn danh là{" "}
        <strong>mất hết</strong>. Hãy tải file sao lưu mỗi khi thêm nhiều thông tin mới.
      </p>
      <p className="muted">
        Hiện có {library.partners.length} đối tác, {library.scenarios.length} tình huống.
      </p>
      <div className="actions">
        <button type="button" className="primary" onClick={exportFile}>
          Tải file sao lưu
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          Nhập từ file…
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {message && <p className="notice">{message}</p>}
    </section>
  );
}

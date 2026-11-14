"use client";

import { useEffect, useState } from "react";
import { loadLibrary, saveLibrary } from "@/lib/store";
import type { Library } from "@/lib/types";
import { Compose } from "./Compose";
import { BackupTab, blankPartner, PartnersTab, ScenariosTab, StyleTab } from "./Editors";

const TABS = [
  ["compose", "Soạn trả lời"],
  ["partners", "Đối tác"],
  ["scenarios", "Tình huống"],
  ["style", "Phong cách"],
  ["backup", "Sao lưu"],
] as const;
type Tab = (typeof TABS)[number][0];

const PASSWORD_KEY = "mail-assistant:password";

export function App() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [tab, setTab] = useState<Tab>("compose");
  const [password, setPassword] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setLibrary(loadLibrary());
    try {
      setPassword(window.localStorage.getItem(PASSWORD_KEY) ?? "");
    } catch {
      /* storage blocked: the user types it each visit */
    }
  }, []);

  useEffect(() => {
    if (library) setSaveFailed(!saveLibrary(library));
  }, [library]);

  function update(fn: (lib: Library) => Library) {
    setLibrary((prev) => (prev ? fn(prev) : prev));
  }

  function upsert<T extends { id: string }>(list: T[], item: T): T[] {
    return list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list];
  }

  if (!library) return <main className="shell" />;

  return (
    <main className="shell">
      <header className="top">
        <h1>Trợ lý trả lời email</h1>
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

      <nav className="tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "tab active" : "tab"} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </nav>

      {saveFailed && <p className="error">Không lưu được vào trình duyệt (có thể đang ở tab ẩn danh). Hãy tải file sao lưu ngay.</p>}

      {tab === "compose" && (
        <Compose
          library={library}
          password={password}
          onAppendHistory={(id, line) =>
            update((lib) => ({
              ...lib,
              partners: lib.partners.map((p) =>
                p.id === id
                  ? { ...p, history: `${p.history.trim()}\n- ${new Date().toISOString().slice(0, 10)}: ${line}`.trim() }
                  : p,
              ),
            }))
          }
          onCreatePartner={(email) => {
            const p = { ...blankPartner(email), name: email.split("@")[0] };
            update((lib) => ({ ...lib, partners: [p, ...lib.partners] }));
            setSelectedPartner(p.id);
            setTab("partners");
          }}
        />
      )}
      {tab === "partners" && (
        <PartnersTab
          partners={library.partners}
          selectedId={selectedPartner}
          onSelect={setSelectedPartner}
          onSave={(p) => {
            update((lib) => ({ ...lib, partners: upsert(lib.partners, p) }));
            setSelectedPartner(p.id);
          }}
          onDelete={(id) => {
            update((lib) => ({ ...lib, partners: lib.partners.filter((p) => p.id !== id) }));
            setSelectedPartner(null);
          }}
        />
      )}
      {tab === "scenarios" && (
        <ScenariosTab
          scenarios={library.scenarios}
          onSave={(s) => update((lib) => ({ ...lib, scenarios: upsert(lib.scenarios, s) }))}
          onDelete={(id) => update((lib) => ({ ...lib, scenarios: lib.scenarios.filter((s) => s.id !== id) }))}
        />
      )}
      {tab === "style" && <StyleTab style={library.style} onSave={(style) => update((lib) => ({ ...lib, style }))} />}
      {tab === "backup" && <BackupTab library={library} onImport={(lib) => update(() => lib)} />}
    </main>
  );
}

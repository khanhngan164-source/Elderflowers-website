"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { addToBag, bagTotals, changeQty, type BagItem } from "@/lib/logic";

const STORAGE_KEY = "eg-bag-v1";

type BagState = { items: BagItem[]; wrap: boolean; wrapNote: string };

type BagContextValue = BagState & {
  totals: ReturnType<typeof bagTotals>;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (item: Omit<BagItem, "qty">) => void;
  setQty: (key: string, delta: number) => void;
  setWrap: (on: boolean) => void;
  setWrapNote: (note: string) => void;
  clear: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
};

const BagContext = createContext<BagContextValue | null>(null);

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside <BagProvider>");
  return ctx;
}

const EMPTY: BagState = { items: [], wrap: false, wrapNote: "" };

export function BagProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BagState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Restore the bag after mount (localStorage is unavailable during static pre-render,
  // and can throw in private mode — the bag then simply isn't remembered).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState({ ...EMPTY, ...JSON.parse(saved) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = useCallback((msg: string) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo<BagContextValue>(
    () => ({
      ...state,
      totals: bagTotals(state.items, state.wrap),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: (item) => {
        setState((s) => ({ ...s, items: addToBag(s.items, item) }));
        showToast("Added · Đã thêm — " + item.name);
      },
      setQty: (key, delta) => setState((s) => ({ ...s, items: changeQty(s.items, key, delta) })),
      setWrap: (wrap) => setState((s) => ({ ...s, wrap })),
      setWrapNote: (wrapNote) => setState((s) => ({ ...s, wrapNote })),
      clear: () => setState(EMPTY),
      toast,
      showToast,
    }),
    [state, isOpen, toast, showToast],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

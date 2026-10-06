"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { feesOf, priceOf, type SiteContent } from "@/lib/content";
import { addToBag, bagTotals, changeQty, type BagItem } from "@/lib/logic";

const STORAGE_KEY = "eg-bag-v1";

type BagState = { items: BagItem[]; wrap: boolean; wrapNote: string };

type BagContextValue = BagState & {
  content: SiteContent;
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
  showToast: (msg: string, withBagLink?: boolean) => void;
  toastHasBagLink: boolean;
};

const BagContext = createContext<BagContextValue | null>(null);

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside <BagProvider>");
  return ctx;
}

/** Site content from the sheet, available to every component. */
export const useContent = () => useBag().content;

const EMPTY: BagState = { items: [], wrap: false, wrapNote: "" };

export function BagProvider({ content, children }: { content: SiteContent; children: ReactNode }) {
  const [state, setState] = useState<BagState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; bag: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Restore the bag after mount (localStorage is unavailable during pre-render, and can throw in
  // private mode). Saved lines are repriced from current content; discontinued ones are dropped.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const s: BagState = { ...EMPTY, ...JSON.parse(saved) };
        const items = s.items.flatMap((it) => {
          const price = priceOf(it.key, content);
          return price == null ? [] : [{ ...it, price }];
        });
        setState({ ...s, items });
      }
    } catch {}
    setHydrated(true);
  }, [content]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = useCallback((msg: string, withBagLink = false) => {
    clearTimeout(toastTimer.current);
    setToast({ msg, bag: withBagLink });
    toastTimer.current = setTimeout(() => setToast(null), withBagLink ? 2600 : 4200);
  }, []);

  const fees = useMemo(() => feesOf(content.settings), [content]);

  const value = useMemo<BagContextValue>(
    () => ({
      ...state,
      content,
      totals: bagTotals(state.items, state.wrap, fees),
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add: (item) => {
        setState((s) => ({ ...s, items: addToBag(s.items, item) }));
        showToast("Added · Đã thêm — " + item.name, true);
      },
      setQty: (key, delta) => setState((s) => ({ ...s, items: changeQty(s.items, key, delta) })),
      setWrap: (wrap) => setState((s) => ({ ...s, wrap })),
      setWrapNote: (wrapNote) => setState((s) => ({ ...s, wrapNote })),
      clear: () => setState(EMPTY),
      toast: toast?.msg ?? null,
      toastHasBagLink: !!toast?.bag,
      showToast,
    }),
    [state, content, fees, isOpen, toast, showToast],
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

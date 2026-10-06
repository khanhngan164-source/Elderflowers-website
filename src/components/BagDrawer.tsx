"use client";

import { useEffect, useRef, useState } from "react";
import { ORDERING_ENABLED, postToCms } from "@/lib/api";
import { feesOf } from "@/lib/content";
import { DELIVERY_SLOTS } from "@/lib/data";
import { WRAP_NOTE_MAX, formatVnd, validateCheckout, type CheckoutErrors, type CheckoutForm } from "@/lib/logic";
import { useBag } from "./BagProvider";
import { Stepper, Toggle, serifText, swatchVars } from "./ui";

type Done = { ref: string; total: number; slot: string; pay: string; wrapped: boolean; bank: { id: string; account: string; name: string } | null };
type Step = "bag" | "checkout" | Done;

const FIELDS: { key: keyof CheckoutForm; label: string; placeholder: string; inputMode?: "tel"; autoComplete: string }[] = [
  { key: "name", label: "Full name · Họ tên", placeholder: "Nguyễn Thu Hà", autoComplete: "name" },
  { key: "phone", label: "Phone · Số điện thoại", placeholder: "0901 234 567", inputMode: "tel", autoComplete: "tel" },
  { key: "address", label: "Address · Địa chỉ", placeholder: "12 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM", autoComplete: "street-address" },
];

/** VietQR image that banking apps scan to prefill account, amount and transfer note. */
const vietQr = (bank: NonNullable<Done["bank"]>, amount: number, ref: string) =>
  `https://img.vietqr.io/image/${encodeURIComponent(bank.id)}-${encodeURIComponent(bank.account)}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(ref)}&accountName=${encodeURIComponent(bank.name)}`;

export function BagDrawer() {
  const bag = useBag();
  const { items, totals, isOpen, close, content } = bag;
  const transferAvailable = Boolean(content.settings.bank_id && content.settings.bank_account);
  const payments = [{ id: "cod", label: "COD · Tiền mặt" }, ...(transferAvailable ? [{ id: "transfer", label: "Chuyển khoản" }] : [])];
  const [step, setStep] = useState<Step>("bag");
  const [form, setForm] = useState<CheckoutForm>({ name: "", phone: "", address: "" });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [slot, setSlot] = useState(1);
  const [pay, setPay] = useState("cod");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);

  const closeDrawer = () => {
    close();
    if (typeof step === "object") setStep("bag");
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const placeOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validateCheckout(form);
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;
    const s = DELIVERY_SLOTS[slot];
    const slotLabel = `${s.label.split(" · ")[0]}, ${s.note}`;
    setSending(true);
    const res = await postToCms({
      type: "order",
      items: items.map((it) => ({ key: it.key, qty: it.qty })),
      wrap: bag.wrap,
      wrapNote: bag.wrapNote,
      ...form,
      slot: slotLabel,
      pay,
      website: new FormData(e.currentTarget).get("website"),
    });
    setSending(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    // The server's total is authoritative (prices are recomputed from the sheet).
    setStep({ ref: res.ref ?? "", total: res.total ?? totals.total, slot: slotLabel.toLowerCase(), pay: res.pay ?? "COD", wrapped: bag.wrap, bank: res.bank ?? null });
    bag.clear();
    setForm({ name: "", phone: "", address: "" });
  };

  const done = typeof step === "object" ? step : null;
  const title = done ? ["Cảm ơn bạn.", "Thank you."] : step === "checkout" ? ["Delivery", "Thông tin giao hàng"] : ["Your bag", `Giỏ hàng · ${totals.count} ${totals.count === 1 ? "item" : "items"}`];

  return (
    <>
      <div className="scrim" onClick={closeDrawer} aria-hidden="true" />
      <aside ref={panelRef} className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" tabIndex={-1}>
        <div className="drawer__head">
          <div className="stack-2">
            <h2 id="drawer-title" lang={done ? "vi" : undefined} className={`serif drawer__title ${done ? "serif-vi" : ""}`}>{title[0]}</h2>
            <span lang={done ? "en" : "vi"} className="vi vi--16">{title[1]}</span>
          </div>
          <div className="row-12">
            {step === "checkout" && (
              <button type="button" className="link-btn" onClick={() => setStep("bag")}>← Bag</button>
            )}
            <button type="button" className="link-btn" onClick={closeDrawer}>Close</button>
          </div>
        </div>

        {done ? (
          <div className="drawer__body">
            <div className="drawer__done">
              <div className="kicker kicker--sage">Order {done.ref}</div>
              <p className="serif drawer__done-title">It’s being picked now.</p>
              <p className="body body--soft">
                Arriving {done.slot}
                {done.wrapped ? ", wrapped in banana leaf with your note" : ""}. We’ll call to confirm and message you on Zalo when the courier leaves.
              </p>
              <p className="body">Total · {done.pay}: <b>{formatVnd(done.total)}</b></p>
              {done.bank && (
                <div className="qr">
                  <p className="body body--soft">
                    Scan to pay · Quét mã để chuyển khoản. Please keep <b>{done.ref}</b> as the transfer note.
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={vietQr(done.bank, done.total, done.ref)} alt={`QR chuyển khoản ${formatVnd(done.total)} tới ${done.bank.name}`} width={280} height={280} />
                  <p className="small muted">{done.bank.id} · {done.bank.account} · {done.bank.name}</p>
                </div>
              )}
              <button type="button" className="pill pill--ink self-start" onClick={closeDrawer}>Back to the garden</button>
            </div>
          </div>
        ) : step === "checkout" && items.length > 0 ? (
          <form className="drawer__form" onSubmit={placeOrder} noValidate>
            <div className="drawer__body stack-14 pt-20">
              {!ORDERING_ENABLED && (
                <p className="notice" role="note">Online ordering opens soon — please message us on Zalo to order. · Đặt hàng online sắp mở, vui lòng nhắn Zalo cho shop.</p>
              )}
              {FIELDS.map((f) => (
                <label key={f.key} className="field">
                  <span className="kicker kicker--sm">{f.label}</span>
                  <input
                    value={form[f.key]}
                    onChange={(e) => {
                      setForm({ ...form, [f.key]: e.target.value });
                      setErrors({ ...errors, [f.key]: undefined });
                    }}
                    placeholder={f.placeholder}
                    inputMode={f.inputMode}
                    autoComplete={f.autoComplete}
                    aria-invalid={!!errors[f.key]}
                    aria-describedby={errors[f.key] ? `err-${f.key}` : undefined}
                    className={errors[f.key] ? "has-error" : ""}
                  />
                  {errors[f.key] && <span id={`err-${f.key}`} className="field__error">{errors[f.key]}</span>}
                </label>
              ))}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
              <div className="stack-10 pt-8" role="radiogroup" aria-label="Delivery window">
                <span className="kicker kicker--sm">Delivery window · Khung giờ</span>
                {DELIVERY_SLOTS.map((s, i) => (
                  <button key={i} type="button" role="radio" aria-checked={slot === i} className={`option-row ${slot === i ? "is-selected" : ""}`} onClick={() => setSlot(i)}>
                    <span>{s.label}</span>
                    <span className="muted">{s.note}</span>
                  </button>
                ))}
              </div>
              <div className="stack-10 pt-8 pb-20" role="radiogroup" aria-label="Payment">
                <span className="kicker kicker--sm">Payment · Thanh toán</span>
                <div className="pay-grid" style={{ gridTemplateColumns: `repeat(${payments.length}, 1fr)` }}>
                  {payments.map((m) => (
                    <button key={m.id} type="button" role="radio" aria-checked={pay === m.id} className={`pay-option ${pay === m.id ? "is-selected" : ""}`} onClick={() => setPay(m.id)}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="drawer__foot">
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="drawer__total">
                <span className="serif">Total · <span lang="vi" className="serif-vi">Tổng</span></span>
                <span>{formatVnd(totals.total)}</span>
              </div>
              <button type="submit" className="pill pill--sage pill--block" disabled={sending}>
                {sending ? "Sending… · Đang gửi" : "Place order · Đặt hàng"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="drawer__body">
              {items.length === 0 ? (
                <div className="drawer__empty">
                  <span className="serif">Nothing picked yet.</span>
                  <span className="muted small">Chưa có gì trong giỏ.</span>
                  <a href="#shop" className="pill pill--outline self-center" onClick={closeDrawer}>Visit the shop</a>
                </div>
              ) : (
                <>
                  {items.map((it) => (
                    <div key={it.key} className="bag-line">
                      <span className="swatch swatch--thumb" style={swatchVars(it.swatch)} />
                      <div className="bag-line__body">
                        <span {...serifText(it.name, "serif bag-line__name")}>{it.name}</span>
                        <span className="muted small">{it.sizeLabel}</span>
                        <div className="bag-line__foot">
                          <Stepper small label={`quantity of ${it.name}`} value={it.qty} onDec={() => bag.setQty(it.key, -1)} onInc={() => bag.setQty(it.key, 1)} />
                          <span className="bag-line__price">{formatVnd(it.price * it.qty)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="wrap-toggle" role="switch" aria-checked={bag.wrap} onClick={() => bag.setWrap(!bag.wrap)}>
                    <span className="stack-2">
                      <span>Gift wrap &amp; handwritten note</span>
                      <span lang="vi" className="vi vi--14">Gói lá chuối, dây gai · + {formatVnd(feesOf(content.settings).wrap)}</span>
                    </span>
                    <Toggle on={bag.wrap} />
                  </button>
                  {bag.wrap && (
                    <label className="wrap-note">
                      <span className="sr-only">Gift note</span>
                      <textarea lang="vi" value={bag.wrapNote} onChange={(e) => bag.setWrapNote(e.target.value)} placeholder="Gửi mẹ, một chút hương vườn…" rows={3} maxLength={WRAP_NOTE_MAX} />
                      <span className="wrap-note__count">{bag.wrapNote.length}/{WRAP_NOTE_MAX}</span>
                    </label>
                  )}
                </>
              )}
            </div>
            {items.length > 0 && (
              <div className="drawer__foot">
                <div className="drawer__line"><span className="body--soft">Subtotal · Tạm tính</span><span>{formatVnd(totals.subtotal + totals.wrapFee)}</span></div>
                <div className="drawer__line"><span className="body--soft">Delivery · Giao hàng</span><span>{totals.delivery === 0 ? "Free · Miễn phí" : formatVnd(totals.delivery)}</span></div>
                <div className="muted small">{totals.delivery === 0 ? "Free delivery in Saigon & Đà Lạt." : `Add ${formatVnd(totals.untilFree)} for free delivery.`}</div>
                <div className="drawer__total">
                  <span className="serif">Total · <span lang="vi" className="serif-vi">Tổng</span></span>
                  <span>{formatVnd(totals.total)}</span>
                </div>
                <button type="button" className="pill pill--ink pill--block" onClick={() => setStep("checkout")}>Checkout · Thanh toán</button>
              </div>
            )}
          </>
        )}
      </aside>
    </>
  );
}

export function Toast() {
  const { toast, toastHasBagLink, open } = useBag();
  if (!toast) return null;
  return (
    <div className="toast" role="status">
      <span>{toast}</span>
      {toastHasBagLink && <button type="button" className="toast__link" onClick={open}>View bag</button>}
    </div>
  );
}

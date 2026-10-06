"use client";

import { useState } from "react";
import { postToCms } from "@/lib/api";
import { BOX_FREQUENCIES, boxKey, type Product } from "@/lib/content";
import { BOX_SWATCH, CATEGORIES, MAX_GUESTS, MONTHS_EN, MONTHS_SHORT, MONTHS_VI, type CategoryId } from "@/lib/data";
import { formatVnd, upcomingVisitDays, validateContact, type CheckoutErrors } from "@/lib/logic";
import { useBag, useContent } from "./BagProvider";
import { Photo, Stepper, serifText } from "./ui";

const toBagItem = (p: Product) => ({ key: p.id, name: p.name, sizeLabel: [p.size, p.vi].filter(Boolean).join(" · "), price: p.price, swatch: p.swatch });

export function Shop() {
  const { add } = useBag();
  const { products } = useContent();
  const [cat, setCat] = useState<CategoryId | "all">("all");
  // Only offer categories that currently have products.
  const cats = (Object.entries(CATEGORIES) as [CategoryId, { en: string; vi: string }][]).filter(([k]) => products.some((p) => p.cat === k));
  const chips: [CategoryId | "all", { en: string; vi: string }][] = [["all", { en: "Everything", vi: "Tất cả" }], ...cats];
  const list = cat === "all" ? products : products.filter((p) => p.cat === cat);

  return (
    <section id="shop" className="container section">
      <div className="section-head section-head--ruled">
        <div className="stack-4">
          <h2 className="section-title">The Shop</h2>
          <p lang="vi" className="vi vi--19">Cửa hàng</p>
        </div>
        <div className="row-8" role="group" aria-label="Filter by category">
          {chips.map(([k, c]) => (
            <button key={k} type="button" className={`chip ${cat === k ? "is-selected" : ""}`} aria-pressed={cat === k} onClick={() => setCat(k)}>
              <span>{c.en}</span>
              <span lang="vi" className="chip__vi">{c.vi}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="product-grid">
        {list.map((p) => (
          <article key={p.id} className="product-card">
            <div className="product-card__media">
              <Photo src={p.image} swatch={p.swatch} caption={p.photo} className="ratio-4-5" />
              <button type="button" className="add-pill" onClick={() => add(toBagItem(p))} aria-label={`Add ${p.name} to bag`}>
                Add +
              </button>
            </div>
            <div className="kicker kicker--sm">{CATEGORIES[p.cat].en} · {CATEGORIES[p.cat].vi}</div>
            <h3 {...serifText(p.name, "product-card__name")}>{p.name}</h3>
            <p lang="vi" className="vi vi--16 tight">{p.vi}</p>
            {p.note && <p className="product-card__note">{p.note}</p>}
            <p className="product-card__price">{formatVnd(p.price)}{p.size && ` · ${p.size}`}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HarvestCalendar({ month, onPick }: { month: number; onPick: (id: string) => void }) {
  const { ingredients } = useContent();
  const [cm, setCm] = useState<number | null>(null);
  const sel = cm ?? month; // follows the current month until the visitor picks one

  return (
    <section id="calendar" className="band band--butter">
      <div className="container cal">
        <div className="stack-12">
          <div className="kicker kicker--butter-ink">The Harvest Calendar · Lịch thu hoạch</div>
          <h2 className="cal__month">{MONTHS_EN[sel]}</h2>
          <p lang="vi" className="vi cal__vi">{MONTHS_VI[sel]}</p>
          <p className="body cal__copy">We only make what the land gives us that month. Choose a month to see what’s being picked.</p>
          <div className="cal__chips" role="group" aria-label="Choose a month">
            {MONTHS_SHORT.map((m, i) => (
              <button key={m} type="button" className={`chip chip--month ${sel === i ? "is-selected" : ""}`} aria-pressed={sel === i} onClick={() => setCm(i)}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="cal__table-wrap">
          <div className="cal__table">
            <div className="cal__row cal__row--head" aria-hidden="true">
              <span />
              {MONTHS_SHORT.map((m, i) => (
                <span key={m} className={i === sel ? "is-now" : ""}>{m[0]}</span>
              ))}
            </div>
            {ingredients.map((g) => {
              const on = g.months.includes(sel);
              return (
                <button key={g.id} type="button" className={`cal__row ${on ? "" : "is-off"}`} onClick={() => onPick(g.id)} aria-label={`${g.name}: ${on ? "in season" : "not in season"} in ${MONTHS_EN[sel]}. Show products.`}>
                  <span className="stack-0">
                    <span className="cal__name">{g.name}</span>
                    <span lang="vi" className="vi vi--14 butter-ink">{g.vi}</span>
                  </span>
                  {MONTHS_SHORT.map((m, i) => (
                    <span key={m} className={`cal__cell ${g.months.includes(i) ? (i === sel ? "is-sel" : "is-on") : ""} ${i === sel ? "is-col" : ""}`} />
                  ))}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FlowerBox() {
  const { add } = useBag();
  const { box: sizes, settings } = useContent();
  const [size, setSize] = useState(Math.min(1, sizes.length - 1));
  const [freq, setFreq] = useState(0);
  const box = sizes[size] ?? sizes[0];
  if (!box) return null;

  return (
    <section id="box" className="band band--plum">
      <div className="container split">
        <Photo src={settings.box_image} swatch={["#5A3545", "#52303F"]} caption="Dã quỳ & cosmos in banana leaf" className="ratio-1-1" dark />
        <div className="stack-20">
          <div className="kicker kicker--butter">The Flower Box · Hộp hoa tươi</div>
          <h2 {...serifText(settings.box_title, "section-title section-title--box")}>{settings.box_title}</h2>
          <p className="body on-dark-muted max-480">{settings.box_copy}</p>
          <div className="stack-8" role="radiogroup" aria-label="Box size">
            {sizes.map((b, i) => (
              <button key={b.name} type="button" role="radio" aria-checked={size === i} className={`box-option ${size === i ? "is-selected" : ""}`} onClick={() => setSize(i)}>
                <span className="stack-2">
                  <span {...serifText(b.name, "serif box-option__name")}>{b.name}</span>
                  <span className="small on-dark-muted">{b.stems}</span>
                </span>
                <span className="box-option__price">{formatVnd(b.price)}</span>
              </button>
            ))}
          </div>
          <div className="segmented" role="radiogroup" aria-label="Frequency">
            {BOX_FREQUENCIES.map((f, i) => (
              <button key={f} type="button" role="radio" aria-checked={freq === i} className={freq === i ? "is-selected" : ""} onClick={() => setFreq(i)}>
                {f}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pill pill--cream pill--lg self-start"
            onClick={() => add({ key: boxKey(box.name, freq), name: `${box.name} Flower Box`, sizeLabel: `${BOX_FREQUENCIES[freq]} subscription · Hộp hoa`, price: box.price, swatch: BOX_SWATCH })}
          >
            Start subscription · {formatVnd(box.price)}
          </button>
        </div>
      </div>
    </section>
  );
}

export function Recipes() {
  const { add } = useBag();
  const { recipes, products } = useContent();
  if (!recipes.length) return null;
  return (
    <section id="journal" className="container section">
      <div className="section-head section-head--ruled">
        <div className="stack-4">
          <h2 className="section-title">From the cordial bar</h2>
          <p lang="vi" className="vi vi--19">Công thức pha chế</p>
        </div>
      </div>
      <div className="recipe-grid">
        {recipes.map((r) => {
          const p = products.find((x) => x.id === r.productId);
          return (
            <article key={r.name} className="stack-10">
              <Photo src={r.image} swatch={r.swatch} caption={r.photo} className="ratio-4-5" />
              {r.time && <div className="kicker kicker--sm">{r.time}</div>}
              <h3 {...serifText(r.name, "recipe__name")}>{r.name}</h3>
              <p lang="vi" className="vi vi--17 tight">{r.vi}</p>
              <p className="product-card__note">{r.method}</p>
              {p && (
                <button type="button" className="link-btn" onClick={() => add(toBagItem(p))}>
                  Add the {p.name} →
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Visit({ today }: { today: Date }) {
  const { showToast } = useBag();
  const { experiences, settings } = useContent();
  const [exp, setExp] = useState(0);
  const [day, setDay] = useState(0);
  const [guests, setGuests] = useState(2);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [status, setStatus] = useState<{ sending?: boolean; error?: string; ref?: string }>({});
  const days = upcomingVisitDays(today);
  const ex = experiences[exp] ?? experiences[0];
  const d = days[day];
  if (!ex) return null;

  const reserve = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateContact(contact);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setStatus({ sending: true });
    const res = await postToCms({ type: "booking", experience: ex.name, date: d.iso, guests, ...contact, website: new FormData(e.currentTarget as HTMLFormElement).get("website") });
    if (res.ok) {
      setStatus({ ref: res.ref });
      showToast(`Reserved · Đã đặt — ${ex.name}, ${d.weekday} ${d.day} ${d.month}`);
    } else setStatus({ error: res.error });
  };

  return (
    <section id="visit" className="container section">
      <div className="split split--top">
        <div className="stack-14">
          <div className="kicker kicker--sage">Visit the farm · Ghé thăm vườn</div>
          <h2 {...serifText(settings.visit_title, "section-title")}>{settings.visit_title}</h2>
          <p className="body body--soft">{settings.visit_copy}</p>
          <Photo src={settings.visit_image} swatch={["#D9DDC8", "#CDD2B9"]} caption="Long table under the pines" className="ratio-16-10" />
        </div>
        {status.ref ? (
          <div className="visit-done stack-14" role="status">
            <div className="kicker kicker--sage">Booking {status.ref}</div>
            <p className="serif visit-done__title">See you on the hill.</p>
            <p lang="vi" className="vi vi--19">Hẹn gặp bạn ở Madagui.</p>
            <p className="body body--soft">
              {ex.name} — {d.weekday} {d.day} {d.month}, {guests} {guests === 1 ? "guest" : "guests"} · {formatVnd(ex.price * guests)}. We’ll call {contact.phone} to confirm and send directions on Zalo.
            </p>
            <button type="button" className="link-btn" onClick={() => setStatus({})}>Book another visit</button>
          </div>
        ) : (
          <form className="stack-10" onSubmit={reserve} noValidate>
            <div className="stack-10" role="radiogroup" aria-label="Experience">
              {experiences.map((x, i) => (
                <button key={x.name} type="button" role="radio" aria-checked={exp === i} className={`exp-card ${exp === i ? "is-selected" : ""}`} onClick={() => setExp(i)}>
                  <span className="exp-card__top">
                    <span {...serifText(x.name, "serif exp-card__name")}>{x.name}</span>
                    <span className="exp-card__price">{formatVnd(x.price)} / guest</span>
                  </span>
                  <span lang="vi" className="vi vi--16">{[x.vi, x.duration].filter(Boolean).join(" · ")}</span>
                  <span className="product-card__note">{x.desc}</span>
                </button>
              ))}
            </div>
            <div className="row-8 pt-8" role="radiogroup" aria-label="Date">
              {days.map((x, i) => (
                <button key={x.key} type="button" role="radio" aria-checked={day === i} className={`date-chip ${day === i ? "is-selected" : ""}`} onClick={() => setDay(i)}>
                  <span className="date-chip__wd">{x.weekday}</span>
                  <span className="serif date-chip__dd">{x.day}</span>
                  <span className="date-chip__mo">{x.month}</span>
                </button>
              ))}
            </div>
            <div className="visit-contact">
              {(["name", "phone"] as const).map((k) => (
                <label key={k} className="field">
                  <span className="kicker kicker--sm">{k === "name" ? "Full name · Họ tên" : "Phone · Số điện thoại"}</span>
                  <input
                    value={contact[k]}
                    onChange={(e) => {
                      setContact({ ...contact, [k]: e.target.value });
                      setErrors({ ...errors, [k]: undefined });
                    }}
                    placeholder={k === "name" ? "Nguyễn Thu Hà" : "0901 234 567"}
                    inputMode={k === "phone" ? "tel" : undefined}
                    autoComplete={k === "name" ? "name" : "tel"}
                    aria-invalid={!!errors[k]}
                    className={errors[k] ? "has-error" : ""}
                  />
                  {errors[k] && <span className="field__error">{errors[k]}</span>}
                </label>
              ))}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
            </div>
            <div className="visit-foot">
              <div className="row-12 center">
                <span className="small">Guests · Khách</span>
                <Stepper label="guests" value={guests} onDec={() => setGuests(Math.max(1, guests - 1))} onInc={() => setGuests(Math.min(MAX_GUESTS, guests + 1))} />
              </div>
              <button type="submit" className="pill pill--sage" disabled={status.sending}>
                {status.sending ? "Sending… · Đang gửi" : `Reserve · ${formatVnd(ex.price * guests)}`}
              </button>
            </div>
            {status.error && <p className="form-error" role="alert">{status.error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}

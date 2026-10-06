"use client";

import { useState } from "react";
import {
  BOX_FREQUENCIES,
  BOX_SIZES,
  BOX_SWATCH,
  CATEGORIES,
  EXPERIENCES,
  INGREDIENTS,
  MAX_GUESTS,
  MONTHS_EN,
  MONTHS_SHORT,
  MONTHS_VI,
  PRODUCTS,
  RECIPES,
  productById,
  type CategoryId,
  type Product,
} from "@/lib/data";
import { formatVnd, upcomingVisitDays } from "@/lib/logic";
import { useBag } from "./BagProvider";
import { Photo, Stepper, swatchVars } from "./ui";

const toBagItem = (p: Product) => ({ key: p.id, name: p.name, sizeLabel: `${p.size} · ${p.vi}`, price: p.price, swatch: p.swatch });

export function Shop() {
  const { add } = useBag();
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const chips: [CategoryId | "all", { en: string; vi: string }][] = [["all", { en: "Everything", vi: "Tất cả" }], ...(Object.entries(CATEGORIES) as [CategoryId, { en: string; vi: string }][])];
  const list = cat === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === cat);

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
              <Photo swatch={p.swatch} caption={p.photo} className="ratio-4-5" />
              <button type="button" className="add-pill" onClick={() => add(toBagItem(p))} aria-label={`Add ${p.name} to bag`}>
                Add +
              </button>
            </div>
            <div className="kicker kicker--sm">{CATEGORIES[p.cat].en} · {CATEGORIES[p.cat].vi}</div>
            <h3 className="product-card__name">{p.name}</h3>
            <p lang="vi" className="vi vi--16 tight">{p.vi}</p>
            <p className="product-card__note">{p.note}</p>
            <p className="product-card__price">{formatVnd(p.price)} · {p.size}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HarvestCalendar({ month, onPick }: { month: number; onPick: (id: string) => void }) {
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
            {INGREDIENTS.map((g) => {
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
  const [size, setSize] = useState(1);
  const [freq, setFreq] = useState(0);
  const box = BOX_SIZES[size];

  return (
    <section id="box" className="band band--plum">
      <div className="container split">
        <Photo swatch={["#5A3545", "#52303F"]} caption="Dã quỳ & cosmos in banana leaf" className="ratio-1-1" dark />
        <div className="stack-20">
          <div className="kicker kicker--butter">The Flower Box · Hộp hoa tươi</div>
          <h2 className="section-title section-title--box">A box of the hillside, delivered every week.</h2>
          <p className="body on-dark-muted max-480">Cut the morning of delivery from Madagui and our Đà Lạt growers. Pause or skip any time.</p>
          <div className="stack-8" role="radiogroup" aria-label="Box size">
            {BOX_SIZES.map((b, i) => (
              <button key={b.name} type="button" role="radio" aria-checked={size === i} className={`box-option ${size === i ? "is-selected" : ""}`} onClick={() => setSize(i)}>
                <span className="stack-2">
                  <span className="serif box-option__name">{b.name}</span>
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
            onClick={() =>
              add({ key: `box-${size}-${freq}`, name: `${box.name} Flower Box`, sizeLabel: `${BOX_FREQUENCIES[freq]} subscription · Hộp hoa`, price: box.price, swatch: BOX_SWATCH })
            }
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
  return (
    <section id="journal" className="container section">
      <div className="section-head section-head--ruled">
        <div className="stack-4">
          <h2 className="section-title">From the cordial bar</h2>
          <p lang="vi" className="vi vi--19">Công thức pha chế</p>
        </div>
      </div>
      <div className="recipe-grid">
        {RECIPES.map((r) => {
          const p = productById(r.productId);
          return (
            <article key={r.name} className="stack-10">
              <Photo swatch={r.swatch} caption={r.photo} className="ratio-4-5" />
              <div className="kicker kicker--sm">{r.time}</div>
              <h3 className="recipe__name">{r.name}</h3>
              <p lang="vi" className="vi vi--17 tight">{r.vi}</p>
              <p className="product-card__note">{r.method}</p>
              <button type="button" className="link-btn" onClick={() => add(toBagItem(p))}>
                Add the {p.name} →
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Visit({ today }: { today: Date }) {
  const { showToast } = useBag();
  const [exp, setExp] = useState(0);
  const [day, setDay] = useState(0);
  const [guests, setGuests] = useState(2);
  const days = upcomingVisitDays(today);
  const ex = EXPERIENCES[exp];
  const d = days[day];

  return (
    <section id="visit" className="container section">
      <div className="split split--top">
        <div className="stack-14">
          <div className="kicker kicker--sage">Visit the farm · Ghé thăm vườn</div>
          <h2 className="section-title">Come up for the weekend. Bring a basket.</h2>
          <p className="body body--soft">Km 152, QL20 · Madagui, Lâm Đồng — about 2½ hours from Saigon. Open Friday to Sunday.</p>
          <Photo swatch={["#D9DDC8", "#CDD2B9"]} caption="Long table under the pines" className="ratio-16-10" />
        </div>
        <div className="stack-10">
          <div className="stack-10" role="radiogroup" aria-label="Experience">
            {EXPERIENCES.map((e, i) => (
              <button key={e.name} type="button" role="radio" aria-checked={exp === i} className={`exp-card ${exp === i ? "is-selected" : ""}`} onClick={() => setExp(i)}>
                <span className="exp-card__top">
                  <span className="serif exp-card__name">{e.name}</span>
                  <span className="exp-card__price">{formatVnd(e.price)} / guest</span>
                </span>
                <span lang="vi" className="vi vi--16">{e.vi} · {e.duration}</span>
                <span className="product-card__note">{e.desc}</span>
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
          <div className="visit-foot">
            <div className="row-12 center">
              <span className="small">Guests · Khách</span>
              <Stepper label="guests" value={guests} onDec={() => setGuests(Math.max(1, guests - 1))} onInc={() => setGuests(Math.min(MAX_GUESTS, guests + 1))} />
            </div>
            <button
              type="button"
              className="pill pill--sage"
              onClick={() =>
                // TODO: send to a booking backend / availability calendar before confirming.
                showToast(`Reserved · Đã đặt — ${ex.name}, ${d.weekday} ${d.day} ${d.month}`)
              }
            >
              Reserve · {formatVnd(ex.price * guests)}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

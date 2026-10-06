"use client";

import { INGREDIENTS, MONTHS_EN, MONTHS_SHORT, MONTHS_VI, PRODUCTS, STORY_BLOCKS, ingredientById } from "@/lib/data";
import { formatVnd, seasonStatus } from "@/lib/logic";
import { useBag } from "./BagProvider";
import { Photo, swatchVars } from "./ui";

export function Hero({ month }: { month: number }) {
  return (
    <section id="top" className="container hero">
      <div className="hero__meta">
        <span>Issue No. 14 · Số 14</span>
        <span>
          {MONTHS_EN[month]} · {MONTHS_VI[month]}
        </span>
        <span>Madagui, Lâm Đồng · 1,000m</span>
      </div>
      <div className="hero__grid">
        <div className="hero__copy">
          <h1 className="hero__title">The Elder&shy;flower Issue</h1>
          <p lang="vi" className="vi hero__vi">Số đặc biệt: Hoa cơm cháy</p>
          <p className="hero__dek">
            Cordials, flowers and herbal goods from a hill once planted with coffee — picked before the sun burns the mist off, bottled and poured by hand.
          </p>
          <div className="row-10">
            <a href="#story" className="pill pill--ink">Read the story</a>
            <a href="#shop" className="pill pill--outline">Shop the harvest</a>
          </div>
        </div>
        <Photo swatch={["#E6DFC6", "#DCD3B6"]} caption="Elderflower heads at dawn, Madagui" className="ratio-5-4" />
      </div>
    </section>
  );
}

export function Story({ onPick }: { onPick: (id: string) => void }) {
  return (
    <section id="story" className="container section">
      <div className="story-grid">
        <div className="stack-10">
          <div className="kicker kicker--sage">The farm story · Câu chuyện</div>
          <h2 className="section-title">Why we pick before the sun.</h2>
          <p lang="vi" className="vi vi--20">Vì sao chúng tôi hái hoa trước bình minh.</p>
        </div>
        {STORY_BLOCKS.map((b) => {
          const g = ingredientById(b.ing);
          return (
            <article key={b.kicker} className="story-block">
              <div className="kicker">{b.kicker}</div>
              <p className="body">{b.text}</p>
              <button type="button" className="meet" onClick={() => onPick(g.id)}>
                <span className="swatch swatch--52" style={swatchVars(g.swatch)} />
                <span className="stack-0">
                  <span className="meet__en">Meet the {g.name.toLowerCase()} →</span>
                  <span lang="vi" className="vi vi--15">{g.vi}</span>
                </span>
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function SeasonBar({ months, current }: { months: number[]; current: number }) {
  return (
    <div className="season-bar" aria-label={`In season: ${months.map((m) => MONTHS_SHORT[m]).join(", ")}`}>
      {MONTHS_SHORT.map((m, i) => (
        <div key={m} className="season-bar__cell">
          <div className={`season-bar__fill ${months.includes(i) ? "is-on" : ""} ${i === current ? "is-now" : ""}`} />
          <span aria-hidden="true">{m[0]}</span>
        </div>
      ))}
    </div>
  );
}

export function Ingredients({ selected, onPick, month }: { selected: string; onPick: (id: string) => void; month: number }) {
  const { add } = useBag();
  const ig = ingredientById(selected);
  const status = seasonStatus(ig, month);
  const products = PRODUCTS.filter((p) => p.ings.includes(ig.id));

  return (
    <section id="ingredients" className="container section">
      <div className="section-head">
        <div className="stack-4">
          <h2 className="section-title section-title--sm">The ingredients</h2>
          <p lang="vi" className="vi vi--19">Nguyên liệu từ vườn &amp; vùng quê</p>
        </div>
        <p className="muted small">Choose one to see what we make from it</p>
      </div>

      <div className="ing-row" role="tablist" aria-label="Ingredients">
        {INGREDIENTS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === selected}
            aria-controls="ingredient-panel"
            className={`ing-chip ${g.id === selected ? "is-selected" : ""}`}
            onClick={() => onPick(g.id)}
          >
            <span className="swatch swatch--104" style={swatchVars(g.swatch)} />
            <span className="ing-chip__name">{g.name}</span>
            <span lang="vi" className="vi vi--15">{g.vi}</span>
          </button>
        ))}
      </div>

      <div id="ingredient-panel" role="tabpanel" className="ing-panel" aria-live="polite">
        <Photo swatch={ig.swatch} caption={ig.photo} className="ing-panel__photo" />
        <div className="ing-panel__body">
          <div className={`kicker ${status.inSeason ? "kicker--sage" : "kicker--late"}`}>{status.label}</div>
          <h3 className="ing-panel__name">{ig.name}</h3>
          <p lang="vi" className="vi vi--22">{ig.vi}</p>
          <p className="body">{ig.story}</p>
          <p className="muted small">Grown · {ig.where}</p>
          <SeasonBar months={ig.months} current={month} />
        </div>
        <div className="ing-panel__products">
          <div className="kicker">Made with {ig.name} · Sản phẩm</div>
          {products.map((p) => (
            <div key={p.id} className="mini-product">
              <span className="swatch swatch--rect" style={swatchVars(p.swatch)} />
              <span className="stack-2">
                <span className="serif mini-product__name">{p.name}</span>
                <span lang="vi" className="vi vi--14">{p.vi}</span>
                <span className="small">{formatVnd(p.price)} · {p.size}</span>
              </span>
              <button
                type="button"
                className="pill pill--outline pill--xs pill--hover-fill"
                onClick={() => add({ key: p.id, name: p.name, sizeLabel: `${p.size} · ${p.vi}`, price: p.price, swatch: p.swatch })}
                aria-label={`Add ${p.name} to bag`}
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

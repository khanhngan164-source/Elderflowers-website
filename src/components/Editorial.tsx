"use client";

import { MONTHS_EN, MONTHS_SHORT, MONTHS_VI } from "@/lib/data";
import { formatVnd, seasonStatus } from "@/lib/logic";
import { useBag, useContent } from "./BagProvider";
import { Photo, serifText, swatchVars } from "./ui";

export function Hero({ month }: { month: number }) {
  const { settings: s } = useContent();
  return (
    <section id="top" className="container hero">
      <div className="hero__meta">
        <span>{s.issue}</span>
        <span>
          {MONTHS_EN[month]} · {MONTHS_VI[month]}
        </span>
        <span>{s.location}</span>
      </div>
      <div className="hero__grid">
        <div className="hero__copy">
          <h1 {...serifText(s.hero_title, "hero__title")}>{s.hero_title}</h1>
          <p lang="vi" className="vi hero__vi">{s.hero_vi}</p>
          <p className="hero__dek">{s.hero_dek}</p>
          <div className="row-10">
            <a href="#story" className="pill pill--ink">Read the story</a>
            <a href="#shop" className="pill pill--outline">Shop the harvest</a>
          </div>
        </div>
        <Photo src={s.hero_image} swatch={["#E6DFC6", "#DCD3B6"]} caption={s.hero_caption} className="ratio-5-4" eager />
      </div>
    </section>
  );
}

export function Story({ onPick }: { onPick: (id: string) => void }) {
  const { settings, story, ingredients } = useContent();
  return (
    <section id="story" className="container section">
      <div className="story-grid">
        <div className="stack-10">
          <div className="kicker kicker--sage">The farm story · Câu chuyện</div>
          <h2 {...serifText(settings.story_title, "section-title")}>{settings.story_title}</h2>
          <p lang="vi" className="vi vi--20">{settings.story_vi}</p>
        </div>
        {story.map((b, i) => {
          const g = ingredients.find((x) => x.id === b.ing);
          return (
            <article key={i} className="story-block">
              <div className="kicker">{b.kicker}</div>
              <p className="body">{b.text}</p>
              {g && (
                <button type="button" className="meet" onClick={() => onPick(g.id)}>
                  <span className="swatch swatch--52" style={swatchVars(g.swatch, g.image)} />
                  <span className="stack-0">
                    <span className="meet__en">Meet the {g.name.toLowerCase()} →</span>
                    <span lang="vi" className="vi vi--15">{g.vi}</span>
                  </span>
                </button>
              )}
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
  const { ingredients, products } = useContent();
  const ig = ingredients.find((g) => g.id === selected) ?? ingredients[0];
  if (!ig) return null;
  const status = seasonStatus(ig, month);
  const made = products.filter((p) => p.ings.includes(ig.id));

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
        {ingredients.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === ig.id}
            aria-controls="ingredient-panel"
            className={`ing-chip ${g.id === ig.id ? "is-selected" : ""}`}
            onClick={() => onPick(g.id)}
          >
            <span className="swatch swatch--104" style={swatchVars(g.swatch, g.image)} />
            <span className="ing-chip__name">{g.name}</span>
            <span lang="vi" className="vi vi--15">{g.vi}</span>
          </button>
        ))}
      </div>

      <div id="ingredient-panel" role="tabpanel" className="ing-panel" aria-live="polite">
        <Photo src={ig.image} swatch={ig.swatch} caption={ig.photo} className="ing-panel__photo" />
        <div className="ing-panel__body">
          {status.label && <div className={`kicker ${status.inSeason ? "kicker--sage" : "kicker--late"}`}>{status.label}</div>}
          <h3 {...serifText(ig.name, "ing-panel__name")}>{ig.name}</h3>
          <p lang="vi" className="vi vi--22">{ig.vi}</p>
          <p className="body">{ig.story}</p>
          {ig.where && <p className="muted small">Grown · {ig.where}</p>}
          <SeasonBar months={ig.months} current={month} />
        </div>
        <div className="ing-panel__products">
          <div className="kicker">Made with {ig.name} · Sản phẩm</div>
          {made.length === 0 && <p className="muted small">Coming soon · Sắp có</p>}
          {made.map((p) => (
            <div key={p.id} className="mini-product">
              <span className="swatch swatch--rect" style={swatchVars(p.swatch, p.image)} />
              <span className="stack-2">
                <span {...serifText(p.name, "serif mini-product__name")}>{p.name}</span>
                <span lang="vi" className="vi vi--14">{p.vi}</span>
                <span className="small">{formatVnd(p.price)}{p.size && ` · ${p.size}`}</span>
              </span>
              <button
                type="button"
                className="pill pill--outline pill--xs pill--hover-fill"
                onClick={() => add({ key: p.id, name: p.name, sizeLabel: [p.size, p.vi].filter(Boolean).join(" · "), price: p.price, swatch: p.swatch })}
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

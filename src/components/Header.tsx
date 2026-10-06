"use client";

import { useBag } from "./BagProvider";
import { Logo } from "./ui";

export function AnnouncementBar() {
  return (
    <div className="announce">
      <span>Free delivery in Saigon &amp; Đà Lạt over 1.000.000₫</span>
      <span aria-hidden="true" className="announce__dot">·</span>
      <span lang="vi" className="vi">Miễn phí giao hàng cho đơn từ 1 triệu</span>
    </div>
  );
}

export function Header() {
  const { totals, open } = useBag();
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <nav className="site-nav" aria-label="Primary">
          <a href="#shop">Shop</a>
          <a href="#calendar">Harvest</a>
          <a href="#box">Flower Box</a>
        </nav>
        <a href="#top" className="site-header__logo" aria-label="Elderflowers Garden — home">
          <Logo />
        </a>
        <nav className="site-nav site-nav--end" aria-label="Secondary">
          <a href="#journal">Journal</a>
          <a href="#visit">Visit</a>
          <button type="button" className="pill pill--outline pill--sm" onClick={open}>
            Bag ({totals.count})
          </button>
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const { showToast } = useBag();
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="stack-14">
          <Logo variant="cream" size={110} />
          <span className="on-dark-muted small">Grown in Madagui · Bottled in Saigon</span>
        </div>
        <div className="footer-links">
          <span className="kicker kicker--butter">Shop</span>
          <a href="#shop">Cordials · Siro</a>
          <a href="#box">Flower Box · Hộp hoa</a>
          <a href="#shop">Candles · Nến thơm</a>
          <a href="#shop">Bath · Tắm gội</a>
        </div>
        <div className="footer-links">
          <span className="kicker kicker--butter">The farm</span>
          <a href="#story">Our story</a>
          <a href="#calendar">Harvest calendar</a>
          <a href="#visit">Visit Madagui</a>
        </div>
        <form
          className="stack-10"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: connect to the newsletter provider (Mailchimp / Klaviyo / Zalo OA).
            showToast("Thank you · Cảm ơn bạn đã đăng ký");
            e.currentTarget.reset();
          }}
        >
          <span className="kicker kicker--butter">Letters from the garden</span>
          <span className="serif footer-letter">One letter a month, when something blooms.</span>
          <label className="newsletter">
            <span className="sr-only">Email</span>
            <input type="email" name="email" required placeholder="email@example.com" autoComplete="email" />
            <button type="submit" aria-label="Subscribe">→</button>
          </label>
        </form>
      </div>
      <div className="container site-footer__bottom">
        <span>© {new Date(process.env.NEXT_PUBLIC_BUILD_DATE ?? Date.now()).getFullYear()} Elderflowers Garden</span>
        <span>Zalo · Instagram · Facebook</span>
      </div>
    </footer>
  );
}

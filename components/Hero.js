import { useEffect, useRef, useState } from 'react';
import { isShopOpenNow, formatTimeLabel } from '../lib/time';
import LogoMark from './Logo';

function StatsRow({ stats }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const nums = el.querySelectorAll('[data-count]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target;
          const count = parseInt(target.dataset.count, 10);
          const suffix = target.dataset.suffix || '';
          const start = performance.now();
          const duration = 1200;
          function step(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            target.textContent = Math.round(eased * count) + suffix;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          io.unobserve(target);
        });
      },
      { threshold: 0.6 }
    );
    nums.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="trust-row" ref={ref}>
      {stats.map((st, i) => (
        <div className="trust-item" key={i}>
          <span className="num" data-count={st.count} data-suffix={st.suffix}>0</span>
          <span className="lbl">{st.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Hero({ content }) {
  const { hero, stats, contact } = content;
  const words = hero.flipWords && hero.flipWords.length ? hero.flipWords : ['New Arrivals'];
  const [flipIndex, setFlipIndex] = useState(0);
  const [flipVisible, setFlipVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setFlipVisible(false);
      setTimeout(() => {
        setFlipIndex((i) => (i + 1) % words.length);
        setFlipVisible(true);
      }, 280);
    }, 2600);
    return () => clearInterval(t);
  }, [words.length]);

  const visualRef = useRef(null);
  const phoneRef = useRef(null);

  const [isOpen, setIsOpen] = useState(null);
  useEffect(() => {
    function check() {
      setIsOpen(isShopOpenNow(contact.openTime, contact.closeTime));
    }
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
  }, [contact.openTime, contact.closeTime]);

  useEffect(() => {
    const visual = visualRef.current;
    const stage = phoneRef.current;
    if (!visual || !stage) return;
    function handleMove(e) {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      stage.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 18}deg)`;
    }
    function handleLeave() {
      stage.style.transform = '';
    }
    visual.addEventListener('mousemove', handleMove);
    visual.addEventListener('mouseleave', handleLeave);
    return () => {
      visual.removeEventListener('mousemove', handleMove);
      visual.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <section id="home" className="wrap hero">
      <div className="hero-copy">
        <div className="eyebrow-row">
          <span className="eyebrow">
            <span className="dot"></span> {hero.eyebrow}
          </span>
          {isOpen === null ? null : (
            <span className={`open-badge ${isOpen ? 'open' : 'closed'}`}>
              {isOpen ? `🟢 Open Now` : `🔴 Closed · Opens ${formatTimeLabel(contact.openTime)}`}
            </span>
          )}
        </div>
        <div className="flip-line">
          🔥 Trending now:{' '}
          <span
            className="flip-word"
            style={{ opacity: flipVisible ? 1 : 0, transform: flipVisible ? 'translateY(0)' : 'translateY(6px)' }}
          >
            {words[flipIndex]}
          </span>
        </div>
        <h1>
          {hero.headlinePrefix} <span className="accent">{hero.headlineAccent}</span> {hero.headlineSuffix}
        </h1>
        <p className="sub">{hero.subheadline}</p>
        <div className="hero-ctas">
          <a href={hero.ctaPrimaryHref} className="btn btn-primary btn-glow">{hero.ctaPrimaryText}</a>
          <a href={hero.ctaSecondaryHref} className="btn btn-gold btn-glow">{hero.ctaSecondaryText}</a>
          <a href={`https://wa.me/91${contact.phone2}`} target="_blank" rel="noreferrer" className="btn btn-ghost">
            {hero.ctaWhatsappText}
          </a>
        </div>
        <StatsRow stats={stats} />
      </div>

      <div className="hero-visual" ref={visualRef}>
        <div className="showcase-stage" ref={phoneRef}>
          {hero.heroImage ? (
            <div className="showcase-photo-frame">
              <img src={hero.heroImage} alt={`${content.brand} shop`} />
              <div className="showcase-photo-caption">{content.brand}</div>
            </div>
          ) : (
            <div className="showcase-card">
              <div className="showcase-mark">
                <LogoMark size={44} />
              </div>
              <div className="showcase-wordmark">{content.brand}</div>
              <div className="showcase-sub">Khojwa Bazar · Varanasi</div>
              <div className="showcase-divider"></div>
              <div className="showcase-chip-row">
                <span className="showcase-chip">🛡️ Protection</span>
                <span className="showcase-chip">🎧 Audio</span>
                <span className="showcase-chip">🔌 Power</span>
              </div>
            </div>
          )}
          <div className="showcase-badge badge-earbuds"><span className="ic">🎧</span> TWS Earbuds</div>
          <div className="showcase-badge badge-cable"><span className="ic">🔌</span> Fast-C Cable</div>
          <div className="showcase-badge badge-glass"><span className="ic">🛡️</span> UV Tempered Glass</div>
        </div>
      </div>
    </section>
  );
}

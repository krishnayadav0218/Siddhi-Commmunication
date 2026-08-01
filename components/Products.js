import { useState } from 'react';
import Reveal from './Reveal';

export default function Products({ content }) {
  const { productCategories, contact } = content;
  const [active, setActive] = useState(productCategories[0] ? productCategories[0].key : '');

  function handleMove(e) {
    const card = e.currentTarget;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-4px)`;
  }
  function handleLeave(e) {
    e.currentTarget.style.transform = '';
  }

  return (
    <section id="accessories" className="section-pad">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Mobile Accessories Storehouse</span>
          <h2>Everything Your Phone Needs</h2>
          <p>Genuine protective gear, audio and charging accessories — tap any item to inquire instantly on WhatsApp.</p>
        </Reveal>

        <div className="tabs">
          {productCategories.map((cat) => (
            <button
              key={cat.key}
              className={`tab-btn${active === cat.key ? ' active' : ''}`}
              onClick={() => setActive(cat.key)}
              type="button"
            >
              {cat.label}
            </button>
          ))}
        </div>

        {productCategories.map((cat) => (
          <div key={cat.key} className={`product-panel${active === cat.key ? ' active' : ''}`}>
            <div className="product-grid">
              {cat.items.map((item, i) => (
                <div className="product-card" key={i} onMouseMove={handleMove} onMouseLeave={handleLeave}>
                  <div className="p-ic">{item.icon}</div>
                  <h4>{item.name}</h4>
                  {item.priceFrom ? <div className="p-price">From {item.priceFrom}</div> : null}
                  <a
                    className="wa-mini"
                    href={`https://wa.me/91${contact.phone1}?text=I%27m%20interested%20in%20${encodeURIComponent(item.name)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    💬 Inquire
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

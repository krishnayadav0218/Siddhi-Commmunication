import { useMemo, useState } from 'react';
import Reveal from './Reveal';
import { useCart } from '../lib/cart';

function ProductCard({ item, contact, onMove, onLeave }) {
  const { addItem, items } = useCart();
  const inCart = items.find((p) => p.id === item.id);

  return (
    <div className="product-card" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="p-ic">{item.icon}</div>
      <h4>{item.name}</h4>
      {item.priceFrom ? <div className="p-price">From {item.priceFrom}</div> : null}
      <div className="product-card-actions">
        <button type="button" className="btn-add-cart" onClick={() => addItem(item, 1)}>
          {inCart ? `🛒 In Cart (${inCart.qty})` : '🛒 Add to Cart'}
        </button>
        <a
          className="wa-mini"
          href={`https://wa.me/91${contact.phone1}?text=I%27m%20interested%20in%20${encodeURIComponent(item.name)}`}
          target="_blank"
          rel="noreferrer"
        >
          💬 Inquire
        </a>
      </div>
    </div>
  );
}

export default function Products({ content }) {
  const { productCategories, contact } = content;
  const [active, setActive] = useState(productCategories[0] ? productCategories[0].key : '');
  const [query, setQuery] = useState('');

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

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const results = [];
    productCategories.forEach((cat) => {
      cat.items.forEach((item) => {
        if (item.name.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)) {
          results.push(item);
        }
      });
    });
    return results;
  }, [query, productCategories]);

  return (
    <section id="accessories" className="section-pad">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Mobile Accessories Storehouse</span>
          <h2>Everything Your Phone Needs</h2>
          <p>Genuine protective gear, audio and charging accessories — add to cart or inquire instantly on WhatsApp.</p>
        </Reveal>

        <div className="product-search">
          <span className="product-search-ic">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accessories — e.g. tempered glass, earbuds, power bank…"
            aria-label="Search accessories"
          />
          {query ? (
            <button type="button" className="product-search-clear" onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          ) : null}
        </div>

        {searchResults ? (
          <div className="product-panel active">
            {searchResults.length === 0 ? (
              <p className="product-search-empty">No matches for &ldquo;{query}&rdquo; — try another term, or ask us on WhatsApp.</p>
            ) : (
              <div className="product-grid">
                {searchResults.map((item) => (
                  <ProductCard key={item.id} item={item} contact={contact} onMove={handleMove} onLeave={handleLeave} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
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
                  {cat.items.map((item) => (
                    <ProductCard key={item.id} item={item} contact={contact} onMove={handleMove} onLeave={handleLeave} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </section>
  );
}

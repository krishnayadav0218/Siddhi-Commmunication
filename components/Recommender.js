import { useMemo, useState } from 'react';
import Reveal from './Reveal';
import { useCart } from '../lib/cart';

const USAGE_TO_CATEGORY = {
  protect: 'protective',
  sound: 'audio',
  power: 'cables',
};

export default function Recommender({ content }) {
  const cfg = content.recommender || {};
  if (!cfg.enabled) return null;

  const { productCategories, services, repairFeatures, contact } = content;
  const [usage, setUsage] = useState(null);
  const [budget, setBudget] = useState(null);
  const { addItem } = useCart();

  const results = useMemo(() => {
    if (!usage) return null;

    if (usage === 'repair') {
      return { type: 'repair', items: repairFeatures || [] };
    }
    if (usage === 'services') {
      return { type: 'services', items: (services || []).slice(0, 4) };
    }

    const catKey = USAGE_TO_CATEGORY[usage];
    const cat = (productCategories || []).find((c) => c.key === catKey);
    if (!cat) return { type: 'products', items: [] };

    const maxPrice = budget ? (cfg.budgetOptions || []).find((b) => b.key === budget)?.max ?? 999999 : 999999;
    const items = cat.items.filter((item) => (item.price || 0) <= maxPrice);
    return { type: 'products', items: items.length ? items : cat.items };
  }, [usage, budget, productCategories, services, repairFeatures, cfg.budgetOptions]);

  function reset() {
    setUsage(null);
    setBudget(null);
  }

  return (
    <section id="recommend" className="section-pad">
      <div className="wrap">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Smart Suggestions</span>
          <h2>{cfg.title || 'Find What You Need'}</h2>
          <p>{cfg.subtitle}</p>
        </Reveal>

        <Reveal className="recommender-box">
          {!usage ? (
            <>
              <p className="recommender-step-label">Step 1 — What are you looking for?</p>
              <div className="recommender-options">
                {(cfg.usageOptions || []).map((opt) => (
                  <button key={opt.key} type="button" className="recommender-chip" onClick={() => setUsage(opt.key)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          ) : usage === 'protect' || usage === 'sound' || usage === 'power' ? (
            !budget ? (
              <>
                <p className="recommender-step-label">Step 2 — What&apos;s your budget?</p>
                <div className="recommender-options">
                  {(cfg.budgetOptions || []).map((opt) => (
                    <button key={opt.key} type="button" className="recommender-chip" onClick={() => setBudget(opt.key)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button type="button" className="recommender-back" onClick={reset}>
                  ← Start over
                </button>
              </>
            ) : (
              <RecommenderResults results={results} contact={contact} onReset={reset} onAdd={addItem} />
            )
          ) : (
            <RecommenderResults results={results} contact={contact} onReset={reset} onAdd={addItem} />
          )}
        </Reveal>
      </div>
    </section>
  );
}

function RecommenderResults({ results, contact, onReset, onAdd }) {
  if (!results) return null;

  return (
    <div className="recommender-results">
      <div className="recommender-results-head">
        <p className="recommender-step-label">Here&apos;s what we&apos;d suggest</p>
        <button type="button" className="recommender-back" onClick={onReset}>
          ↻ Try again
        </button>
      </div>

      {results.type === 'products' && (
        <div className="recommender-grid">
          {results.items.slice(0, 6).map((item) => (
            <div className="recommender-card" key={item.id}>
              <span className="p-ic">{item.icon}</span>
              <h4>{item.name}</h4>
              {item.priceFrom ? <div className="p-price">From {item.priceFrom}</div> : null}
              <button type="button" className="btn-add-cart" onClick={() => onAdd(item, 1)}>
                🛒 Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {results.type === 'repair' && (
        <div className="recommender-grid">
          {results.items.map((f, i) => (
            <div className="recommender-card" key={i}>
              <h4>{f.title}</h4>
              <p className="recommender-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      )}

      {results.type === 'services' && (
        <div className="recommender-grid">
          {results.items.map((svc, i) => (
            <div className="recommender-card" key={i}>
              <span className="p-ic">{svc.icon}</span>
              <h4>{svc.title}</h4>
              <p className="recommender-card-desc">{svc.desc}</p>
            </div>
          ))}
        </div>
      )}

      <a
        className="btn btn-primary btn-block"
        href={`https://wa.me/91${contact.phone1}?text=${encodeURIComponent('Hi, I got a recommendation from your website and want to know more.')}`}
        target="_blank"
        rel="noreferrer"
      >
        💬 Ask Us on WhatsApp
      </a>
    </div>
  );
}

import { useState } from 'react';
import Reveal from './Reveal';

const NEEDS = [
  { key: 'protective', label: '🛡️ Protect my phone', type: 'product', categoryKey: 'protective' },
  { key: 'audio', label: '🎧 Better audio', type: 'product', categoryKey: 'audio' },
  { key: 'cables', label: '🔌 Charging & power', type: 'product', categoryKey: 'cables' },
  { key: 'repair', label: '🛠️ Phone repair', type: 'repair' },
  { key: 'recharge', label: '📶 Recharge / SIM / AEPS', type: 'service', match: ['Recharge', 'SIM', 'AEPS'] },
  { key: 'tickets', label: '🎫 Book tickets', type: 'service', match: ['Booking'] },
];

const BUDGETS = [
  { key: 'low', label: 'Under ₹200', max: 200 },
  { key: 'mid', label: '₹200 – ₹500', max: 500 },
  { key: 'high', label: '₹500+', max: Infinity },
];

function parsePrice(priceFrom) {
  if (!priceFrom) return 0;
  const digits = priceFrom.replace(/[^\d]/g, '');
  return parseInt(digits, 10) || 0;
}

function getResults(content, need, budgetKey) {
  if (!need) return null;
  if (need.type === 'product') {
    const cat = content.productCategories.find((c) => c.key === need.categoryKey);
    if (!cat) return { items: [] };
    const maxPrice = budgetKey ? BUDGETS.find((b) => b.key === budgetKey).max : Infinity;
    return { items: cat.items.filter((it) => parsePrice(it.priceFrom) <= maxPrice) };
  }
  if (need.type === 'service') {
    return { items: content.services.filter((s) => need.match.some((m) => s.title.includes(m))) };
  }
  if (need.type === 'repair') {
    return { items: content.repairFeatures.map((f) => ({ icon: '🛠️', title: f.title, desc: f.desc })) };
  }
  return null;
}

export default function FinderQuiz({ content }) {
  const [need, setNeed] = useState(null);
  const [budget, setBudget] = useState(null);

  function reset() {
    setNeed(null);
    setBudget(null);
  }

  const needsBudgetStep = need && need.type === 'product' && !budget;
  const showResults = need && !needsBudgetStep;
  const results = showResults ? getResults(content, need, budget) : null;

  return (
    <section className="section-pad">
      <div className="wrap wrap-narrow">
        <Reveal className="sec-head">
          <span className="sec-eyebrow">Not Sure What You Need?</span>
          <h2>Find It In 10 Seconds</h2>
          <p>Answer a couple of quick questions and we&apos;ll point you to the right thing.</p>
        </Reveal>
        <Reveal>
          <div className="finder-card">
            {!need ? (
              <>
                <p className="finder-question">What are you looking for today?</p>
                <div className="finder-options">
                  {NEEDS.map((n) => (
                    <button key={n.key} className="finder-chip" onClick={() => setNeed(n)} type="button">
                      {n.label}
                    </button>
                  ))}
                </div>
              </>
            ) : needsBudgetStep ? (
              <>
                <p className="finder-question">What&apos;s your budget?</p>
                <div className="finder-options">
                  {BUDGETS.map((b) => (
                    <button key={b.key} className="finder-chip" onClick={() => setBudget(b.key)} type="button">
                      {b.label}
                    </button>
                  ))}
                </div>
                <button className="finder-back" onClick={reset} type="button">← Start over</button>
              </>
            ) : (
              <>
                <p className="finder-question">Here&apos;s what we&apos;d suggest:</p>
                <div className="finder-results">
                  {results && results.items.length ? (
                    results.items.map((it, i) => (
                      <div className="finder-result-item" key={i}>
                        <span>{it.icon}</span>
                        <div>
                          <div className="finder-result-name">{it.title || it.name}</div>
                          {it.priceFrom ? <div className="finder-result-price">From {it.priceFrom}</div> : null}
                          {it.desc ? <div className="finder-result-desc">{it.desc}</div> : null}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="finder-empty">
                      Nothing in that exact range — message us and we&apos;ll help you find the best fit.
                    </p>
                  )}
                </div>
                <div className="finder-actions">
                  <a
                    href={`https://wa.me/91${content.contact.phone1}?text=${encodeURIComponent(`Hi, I'm looking for: ${need.label}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-gold btn-glow"
                  >
                    💬 Ask About These
                  </a>
                  <button className="finder-back" onClick={reset} type="button">↻ Try again</button>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

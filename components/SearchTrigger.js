import { useMemo, useState } from 'react';

function buildIndex(content) {
  const index = [];
  (content.services || []).forEach((s) =>
    index.push({ type: 'Service', icon: s.icon, title: s.title, desc: s.desc, href: '#services' })
  );
  (content.productCategories || []).forEach((cat) => {
    (cat.items || []).forEach((it) =>
      index.push({
        type: cat.label,
        icon: it.icon,
        title: it.name,
        desc: it.priceFrom ? `From ${it.priceFrom}` : '',
        href: '#accessories',
      })
    );
  });
  (content.repairFeatures || []).forEach((f) =>
    index.push({ type: 'Repair', icon: '🛠️', title: f.title, desc: f.desc, href: '#repairing' })
  );
  return index;
}

function SearchOverlay({ content, onClose }) {
  const [query, setQuery] = useState('');
  const index = useMemo(() => buildIndex(content), [content]);
  const trimmed = query.trim().toLowerCase();
  const results = trimmed
    ? index.filter((it) => (it.title + ' ' + it.desc).toLowerCase().includes(trimmed)).slice(0, 8)
    : [];

  function handleResultClick(href) {
    onClose();
    setTimeout(() => {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 120);
  }

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <span aria-hidden="true">🔍</span>
          <input
            autoFocus
            placeholder="Search products, services, repairs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={onClose} aria-label="Close search" type="button">✕</button>
        </div>
        <div className="search-results">
          {trimmed && results.length === 0 ? <p className="search-empty">No matches — try a different word.</p> : null}
          {results.map((r, i) => (
            <button key={i} className="search-result" onClick={() => handleResultClick(r.href)} type="button">
              <span className="search-result-ic">{r.icon}</span>
              <div>
                <div className="search-result-title">{r.title}</div>
                <div className="search-result-meta">
                  {r.type}
                  {r.desc ? ` · ${r.desc}` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchTrigger({ content }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="search-trigger" onClick={() => setOpen(true)} aria-label="Search" type="button">
        🔍
      </button>
      {open ? <SearchOverlay content={content} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

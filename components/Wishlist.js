import { useState } from 'react';
import { useWishlist } from '../lib/useWishlist';

function buildWhatsAppLink(phone, items) {
  const list = items.map((it) => `- ${it.name}`).join('%0A');
  return `https://wa.me/91${phone}?text=${encodeURIComponent("Hi, I'm interested in:")}%0A${list}`;
}

function WishlistDrawer({ phone, onClose }) {
  const { items, toggle } = useWishlist();

  return (
    <div className="wishlist-overlay" onClick={onClose}>
      <div className="wishlist-panel" onClick={(e) => e.stopPropagation()}>
        <div className="wishlist-header">
          <h3>Your Wishlist</h3>
          <button onClick={onClose} aria-label="Close wishlist" type="button">✕</button>
        </div>
        {items.length === 0 ? (
          <p className="wishlist-empty">No items saved yet. Tap the ❤️ on any product to save it here.</p>
        ) : (
          <div className="wishlist-items">
            {items.map((it, i) => (
              <div className="wishlist-item" key={i}>
                <span className="wishlist-ic">{it.icon}</span>
                <div className="wishlist-info">
                  <div className="wishlist-name">{it.name}</div>
                  {it.priceFrom ? <div className="wishlist-price">From {it.priceFrom}</div> : null}
                </div>
                <button className="wishlist-remove" onClick={() => toggle(it)} aria-label={`Remove ${it.name}`} type="button">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        {items.length > 0 ? (
          <a
            className="btn btn-gold btn-glow wishlist-cta"
            href={buildWhatsAppLink(phone, items)}
            target="_blank"
            rel="noreferrer"
          >
            💬 Inquire About All on WhatsApp
          </a>
        ) : null}
      </div>
    </div>
  );
}

export default function WishlistButton({ phone }) {
  const { items } = useWishlist();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="wishlist-btn" onClick={() => setOpen(true)} aria-label="View wishlist" type="button">
        <span>🤍</span>
        {items.length > 0 ? <span className="wishlist-count">{items.length}</span> : null}
      </button>
      {open ? <WishlistDrawer phone={phone} onClose={() => setOpen(false)} /> : null}
    </>
  );
}
